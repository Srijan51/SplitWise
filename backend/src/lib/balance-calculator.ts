import prisma from "./prisma";
import cache from "./cache";

export type MemberBalance = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  netBalance: number; // positive = owed money, negative = owes money
};

export type SimplifiedDebt = {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
};

export type GroupBalances = {
  memberBalances: MemberBalance[];
  simplifiedDebts: SimplifiedDebt[];
};

/**
 * Compute group balances from source of truth (Expense + ExpenseSplit + Settlement).
 * Balances are DERIVED, never stored as running totals.
 */
export async function computeGroupBalances(
  groupId: string
): Promise<GroupBalances> {
  // Check cache first
  const cacheKey = `balances:${groupId}`;
  const cached = cache.get<GroupBalances>(cacheKey);
  if (cached) return cached;

  // Get all group members
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  // Get all non-draft expenses with their splits
  const expenses = await prisma.expense.findMany({
    where: { groupId, isDraft: false },
    include: { splits: true },
  });

  // Get all confirmed settlements
  const settlements = await prisma.settlement.findMany({
    where: { groupId, confirmedByRecipient: true },
  });

  // Build net balance map: userId -> netBalance
  // Positive = this person is owed money (creditor)
  // Negative = this person owes money (debtor)
  const balanceMap = new Map<string, number>();
  for (const m of members) {
    balanceMap.set(m.userId, 0);
  }

  // Process expenses
  for (const expense of expenses) {
    // The payer gets credit for paying the full amount
    const current = balanceMap.get(expense.paidById) ?? 0;
    balanceMap.set(expense.paidById, current + expense.amount);

    // Each split participant owes their share
    for (const split of expense.splits) {
      const splitCurrent = balanceMap.get(split.userId) ?? 0;
      balanceMap.set(split.userId, splitCurrent - split.amountOwed);
    }
  }

  // Process confirmed settlements: fromUser paid toUser
  for (const settlement of settlements) {
    // fromUser reduces their debt (was negative, becomes less negative)
    const fromCurrent = balanceMap.get(settlement.fromUserId) ?? 0;
    balanceMap.set(settlement.fromUserId, fromCurrent + settlement.amount);

    // toUser receives payment (was positive, becomes less positive)
    const toCurrent = balanceMap.get(settlement.toUserId) ?? 0;
    balanceMap.set(settlement.toUserId, toCurrent - settlement.amount);
  }

  // Build member balances
  const memberBalances: MemberBalance[] = members.map((m) => ({
    userId: m.user.id,
    name: m.user.name,
    avatarUrl: m.user.avatarUrl,
    netBalance: Math.round((balanceMap.get(m.userId) ?? 0) * 100) / 100,
  }));

  // Compute simplified debts
  const simplifiedDebts = simplifyDebts(memberBalances);

  const result: GroupBalances = { memberBalances, simplifiedDebts };

  // Cache for 5 minutes
  cache.set(cacheKey, result);

  return result;
}

/**
 * Greedy debt simplification algorithm.
 * 
 * 1. Compute each member's net balance (total paid - total owed)
 * 2. Split into creditors (positive) and debtors (negative)
 * 3. Greedily match largest debtor with largest creditor
 * 4. Settle the smaller of the two amounts each time
 * 5. Repeat until all balances are ~zero
 * 
 * Returns minimal list of transactions to settle all debts.
 */
export function simplifyDebts(
  memberBalances: MemberBalance[]
): SimplifiedDebt[] {
  const EPSILON = 0.01; // tolerance for floating point

  // Separate into debtors and creditors
  const debtors: { userId: string; name: string; amount: number }[] = [];
  const creditors: { userId: string; name: string; amount: number }[] = [];

  for (const mb of memberBalances) {
    if (mb.netBalance < -EPSILON) {
      debtors.push({
        userId: mb.userId,
        name: mb.name,
        amount: Math.abs(mb.netBalance),
      });
    } else if (mb.netBalance > EPSILON) {
      creditors.push({
        userId: mb.userId,
        name: mb.name,
        amount: mb.netBalance,
      });
    }
  }

  // Sort both by amount descending (largest first)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: SimplifiedDebt[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settleAmount =
      Math.round(Math.min(debtor.amount, creditor.amount) * 100) / 100;

    if (settleAmount > EPSILON) {
      transactions.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount: settleAmount,
      });
    }

    debtor.amount = Math.round((debtor.amount - settleAmount) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - settleAmount) * 100) / 100;

    if (debtor.amount < EPSILON) i++;
    if (creditor.amount < EPSILON) j++;
  }

  return transactions;
}

/**
 * Invalidate cached balances for a group (call after any expense/settlement change)
 */
export function invalidateGroupBalances(groupId: string): void {
  cache.invalidate(`balances:${groupId}`);
}

/**
 * Compute server-side expense splits based on split type.
 * This is the source of truth — never trust client-side math.
 */
export function computeExpenseSplits(
  amount: number,
  splitType: string,
  memberIds: string[],
  splitDetails?: Record<string, number> // userId -> amount/percentage/shares
): { userId: string; amountOwed: number }[] {
  switch (splitType) {
    case "EQUAL": {
      const perPerson = Math.floor((amount / memberIds.length) * 100) / 100;
      const remainder =
        Math.round((amount - perPerson * memberIds.length) * 100) / 100;

      return memberIds.map((userId, idx) => ({
        userId,
        amountOwed: idx === 0 ? perPerson + remainder : perPerson,
      }));
    }

    case "UNEQUAL": {
      if (!splitDetails) throw new Error("Split details required for UNEQUAL");
      const total = Object.values(splitDetails).reduce((a, b) => a + b, 0);
      if (Math.abs(total - amount) > 0.01) {
        throw new Error(
          `Unequal split amounts (${total}) don't match total (${amount})`
        );
      }
      return memberIds.map((userId) => ({
        userId,
        amountOwed: splitDetails[userId] ?? 0,
      }));
    }

    case "PERCENTAGE": {
      if (!splitDetails)
        throw new Error("Split details required for PERCENTAGE");
      const totalPct = Object.values(splitDetails).reduce((a, b) => a + b, 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        throw new Error(`Percentages (${totalPct}) don't sum to 100`);
      }
      const splits = memberIds.map((userId) => ({
        userId,
        amountOwed:
          Math.round(((splitDetails[userId] ?? 0) / 100) * amount * 100) / 100,
      }));
      // Fix rounding: adjust first person
      const splitTotal = splits.reduce((a, b) => a + b.amountOwed, 0);
      const diff = Math.round((amount - splitTotal) * 100) / 100;
      if (Math.abs(diff) > 0 && splits.length > 0) {
        splits[0].amountOwed =
          Math.round((splits[0].amountOwed + diff) * 100) / 100;
      }
      return splits;
    }

    case "SHARES": {
      if (!splitDetails) throw new Error("Split details required for SHARES");
      const totalShares = Object.values(splitDetails).reduce(
        (a, b) => a + b,
        0
      );
      if (totalShares === 0) throw new Error("Total shares cannot be zero");
      const splits = memberIds.map((userId) => ({
        userId,
        amountOwed:
          Math.round(
            ((splitDetails[userId] ?? 0) / totalShares) * amount * 100
          ) / 100,
      }));
      // Fix rounding
      const splitTotal = splits.reduce((a, b) => a + b.amountOwed, 0);
      const diff = Math.round((amount - splitTotal) * 100) / 100;
      if (Math.abs(diff) > 0 && splits.length > 0) {
        splits[0].amountOwed =
          Math.round((splits[0].amountOwed + diff) * 100) / 100;
      }
      return splits;
    }

    default:
      throw new Error(`Unknown split type: ${splitType}`);
  }
}
