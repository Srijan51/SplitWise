import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireGroupAdmin } from "@/lib/auth-guard";
import { computeGroupBalances, simplifyDebts, invalidateGroupBalances } from "@/lib/balance-calculator";

// POST /api/groups/[groupId]/finalize-trip — finalize trip and show final debts
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    await requireGroupAdmin(groupId);

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group || group.type !== "TRIP") {
      return NextResponse.json({ error: "Not a trip group" }, { status: 400 });
    }

    if (group.finalized) {
      return NextResponse.json({ error: "Trip already finalized" }, { status: 400 });
    }

    // Compute final balances scoped to this trip
    const balances = await computeGroupBalances(groupId);
    const simplifiedDebts = balances.simplifiedDebts;

    // Mark as finalized
    await prisma.group.update({
      where: { id: groupId },
      data: { finalized: true, endDate: new Date() },
    });

    invalidateGroupBalances(groupId);

    return NextResponse.json({
      message: "Trip finalized! 🏁",
      simplifiedDebts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
