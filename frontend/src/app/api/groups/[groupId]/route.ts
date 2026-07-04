import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireGroupMember } from "@/lib/auth-guard";

// GET /api/groups/[groupId] — get group details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const { userId } = await requireGroupMember(groupId);

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
          orderBy: { joinedAt: "asc" },
        },
        expenses: {
          where: { isDraft: false },
          include: {
            paidBy: { select: { id: true, name: true, avatarUrl: true } },
            splits: { include: { user: { select: { id: true, name: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        settlements: {
          include: {
            fromUser: { select: { id: true, name: true } },
            toUser: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ ...group, currentUserId: userId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    if (message === "Not a member of this group") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
