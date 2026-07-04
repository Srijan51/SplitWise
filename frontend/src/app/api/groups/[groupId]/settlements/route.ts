import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireGroupMember } from "@/lib/auth-guard";
import { invalidateGroupBalances } from "@/lib/balance-calculator";
import { emitToGroup } from "@/lib/socket-server";

// POST /api/groups/[groupId]/settlements — create settlement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { userId } = await requireGroupMember(groupId);
    const body = await request.json();

    const { toUserId, amount, method } = body;

    if (!toUserId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid settlement details" }, { status: 400 });
    }

    if (toUserId === userId) {
      return NextResponse.json({ error: "Cannot settle with yourself" }, { status: 400 });
    }

    // Verify recipient is a group member
    const recipientMember = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: toUserId, groupId } },
    });
    if (!recipientMember) {
      return NextResponse.json({ error: "Recipient is not a group member" }, { status: 400 });
    }

    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        fromUserId: userId,
        toUserId,
        amount,
        method: method || "CASH",
        confirmedByRecipient: false,
      },
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
      },
    });

    // Push notification to group
    emitToGroup(groupId, "settlement:created", settlement);

    return NextResponse.json(settlement, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/groups/[groupId]/settlements — confirm settlement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { userId } = await requireGroupMember(groupId);
    const body = await request.json();

    const { settlementId, confirmed } = body;

    const settlement = await prisma.settlement.findUnique({
      where: { id: settlementId },
    });

    if (!settlement || settlement.groupId !== groupId) {
      return NextResponse.json({ error: "Settlement not found" }, { status: 404 });
    }

    // Only the recipient can confirm
    if (settlement.toUserId !== userId) {
      return NextResponse.json({ error: "Only the recipient can confirm" }, { status: 403 });
    }

    const updated = await prisma.settlement.update({
      where: { id: settlementId },
      data: { confirmedByRecipient: confirmed },
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
      },
    });

    // Invalidate balances only when confirmed
    if (confirmed) {
      invalidateGroupBalances(groupId);
    }

    // Push update
    emitToGroup(groupId, "settlement:updated", updated);
    emitToGroup(groupId, "balance:updated", { groupId });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
