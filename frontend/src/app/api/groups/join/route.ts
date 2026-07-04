import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

// POST /api/groups/join — join by invite code (without knowing groupId)
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode || inviteCode.trim().length === 0) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
    });

    if (!group) {
      return NextResponse.json({ error: "No group found with that invite code" }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: group.id } },
    });

    if (existing) {
      return NextResponse.json({ groupId: group.id, alreadyMember: true });
    }

    await prisma.groupMember.create({
      data: { userId, groupId: group.id, role: "MEMBER" },
    });

    return NextResponse.json({ groupId: group.id, joined: true }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
