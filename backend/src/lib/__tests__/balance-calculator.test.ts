import { describe, it, expect } from "vitest";
import { simplifyDebts, computeExpenseSplits } from "../balance-calculator";
import type { MemberBalance } from "../balance-calculator";

describe("simplifyDebts", () => {
  it("handles simple 2-person debt", () => {
    const balances: MemberBalance[] = [
      { userId: "a", name: "Alice", avatarUrl: null, netBalance: 50 },
      { userId: "b", name: "Bob", avatarUrl: null, netBalance: -50 },
    ];

    const result = simplifyDebts(balances);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fromUserId: "b",
      fromName: "Bob",
      toUserId: "a",
      toName: "Alice",
      amount: 50,
    });
  });

  it("handles 3+ person circular debt", () => {
    // Alice paid 120, Bob paid 60, Charlie paid 0. Total = 180, each owes 60.
    // Alice net = 120 - 60 = +60 (owed 60)
    // Bob net = 60 - 60 = 0 (settled)
    // Charlie net = 0 - 60 = -60 (owes 60)
    const balances: MemberBalance[] = [
      { userId: "a", name: "Alice", avatarUrl: null, netBalance: 60 },
      { userId: "b", name: "Bob", avatarUrl: null, netBalance: 0 },
      { userId: "c", name: "Charlie", avatarUrl: null, netBalance: -60 },
    ];

    const result = simplifyDebts(balances);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fromUserId: "c",
      fromName: "Charlie",
      toUserId: "a",
      toName: "Alice",
      amount: 60,
    });
  });

  it("handles complex 4-person circular debt with multiple transactions", () => {
    // A: +100, B: +50, C: -70, D: -80
    const balances: MemberBalance[] = [
      { userId: "a", name: "Alice", avatarUrl: null, netBalance: 100 },
      { userId: "b", name: "Bob", avatarUrl: null, netBalance: 50 },
      { userId: "c", name: "Charlie", avatarUrl: null, netBalance: -70 },
      { userId: "d", name: "Dave", avatarUrl: null, netBalance: -80 },
    ];

    const result = simplifyDebts(balances);
    // Should produce minimal transactions
    expect(result.length).toBeLessThanOrEqual(3);

    // Verify all debts are settled
    const netAfter = new Map<string, number>();
    for (const b of balances) netAfter.set(b.userId, b.netBalance);

    for (const txn of result) {
      netAfter.set(
        txn.fromUserId,
        (netAfter.get(txn.fromUserId) ?? 0) + txn.amount
      );
      netAfter.set(
        txn.toUserId,
        (netAfter.get(txn.toUserId) ?? 0) - txn.amount
      );
    }

    for (const [, balance] of netAfter) {
      expect(Math.abs(balance)).toBeLessThan(0.02);
    }
  });

  it("handles group where balances already net to zero", () => {
    const balances: MemberBalance[] = [
      { userId: "a", name: "Alice", avatarUrl: null, netBalance: 0 },
      { userId: "b", name: "Bob", avatarUrl: null, netBalance: 0 },
      { userId: "c", name: "Charlie", avatarUrl: null, netBalance: 0 },
    ];

    const result = simplifyDebts(balances);
    expect(result).toHaveLength(0);
  });

  it("handles single person with zero balance", () => {
    const balances: MemberBalance[] = [
      { userId: "a", name: "Alice", avatarUrl: null, netBalance: 0 },
    ];

    const result = simplifyDebts(balances);
    expect(result).toHaveLength(0);
  });

  it("total of all debts nets to zero", () => {
    const balances: MemberBalance[] = [
      { userId: "a", name: "Alice", avatarUrl: null, netBalance: 200 },
      { userId: "b", name: "Bob", avatarUrl: null, netBalance: -50 },
      { userId: "c", name: "Charlie", avatarUrl: null, netBalance: -80 },
      { userId: "d", name: "Dave", avatarUrl: null, netBalance: -70 },
    ];

    const result = simplifyDebts(balances);
    const totalFrom = result.reduce((sum, t) => sum + t.amount, 0);
    // totalFrom should equal sum of debtor amounts
    expect(totalFrom).toBeCloseTo(200, 1);
  });
});

describe("computeExpenseSplits", () => {
  it("splits equally with no remainder", () => {
    const splits = computeExpenseSplits(300, "EQUAL", ["a", "b", "c"]);
    expect(splits).toHaveLength(3);
    for (const s of splits) {
      expect(s.amountOwed).toBe(100);
    }
  });

  it("handles equal split with remainder (penny correction)", () => {
    const splits = computeExpenseSplits(100, "EQUAL", ["a", "b", "c"]);
    expect(splits).toHaveLength(3);
    const total = splits.reduce((s, x) => s + x.amountOwed, 0);
    expect(total).toBeCloseTo(100, 2);
  });

  it("validates unequal splits sum to total", () => {
    expect(() =>
      computeExpenseSplits(100, "UNEQUAL", ["a", "b"], { a: 60, b: 50 })
    ).toThrow("don't match total");
  });

  it("computes percentage splits correctly", () => {
    const splits = computeExpenseSplits(200, "PERCENTAGE", ["a", "b"], {
      a: 70,
      b: 30,
    });
    expect(splits[0].amountOwed).toBe(140);
    expect(splits[1].amountOwed).toBe(60);
  });

  it("validates percentages sum to 100", () => {
    expect(() =>
      computeExpenseSplits(100, "PERCENTAGE", ["a", "b"], { a: 60, b: 60 })
    ).toThrow("don't sum to 100");
  });

  it("computes share-based splits correctly", () => {
    // 2 shares : 1 share out of 300 = 200, 100
    const splits = computeExpenseSplits(300, "SHARES", ["a", "b"], {
      a: 2,
      b: 1,
    });
    expect(splits[0].amountOwed).toBe(200);
    expect(splits[1].amountOwed).toBe(100);
  });
});
