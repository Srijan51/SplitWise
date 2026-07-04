import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireGroupMember } from "@/lib/auth-guard";

// POST /api/groups/[groupId]/reminders — send a nudge
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { userId } = await requireGroupMember(groupId);
    const body = await request.json();
    const { toUserId } = body;

    if (!toUserId || toUserId === userId) {
      return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
    }

    // Rate limit: max once per 24h per debt pair
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await prisma.reminderLog.findFirst({
      where: {
        fromUserId: userId,
        toUserId,
        groupId,
        sentAt: { gte: twentyFourHoursAgo },
      },
    });

    if (recent) {
      return NextResponse.json(
        { error: "You already sent a reminder in the last 24 hours. Give them some time! 😊" },
        { status: 429 }
      );
    }

    await prisma.reminderLog.create({
      data: { fromUserId: userId, toUserId, groupId },
    });

    // In a real app, this would send a notification (email/push)
    // For now, we just log it

    return NextResponse.json({ success: true, message: "Nudge sent! 🔔" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
