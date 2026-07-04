import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

// GET /api/recurring — list recurring templates for user's groups
export async function GET() {
  try {
    const userId = await requireAuth();

    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });

    const groupIds = memberships.map((m) => m.groupId);

    const templates = await prisma.recurringTemplate.findMany({
      where: { groupId: { in: groupIds } },
      include: {
        group: { select: { id: true, name: true, emoji: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/recurring — create a recurring template
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    const { groupId, name, defaultAmount, splitRule, dayOfMonth, category } = body;

    // Verify user is admin of the group
    const membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const template = await prisma.recurringTemplate.create({
      data: {
        groupId,
        name,
        defaultAmount: defaultAmount || 0,
        splitRule: JSON.stringify(splitRule || {}),
        dayOfMonth: dayOfMonth || 1,
        category: category || "Recurring",
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
