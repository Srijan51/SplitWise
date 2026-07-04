import { NextRequest, NextResponse } from "next/server";
import { requireGroupMember } from "@/lib/auth-guard";
import { computeGroupBalances } from "@/lib/balance-calculator";

// GET /api/groups/[groupId]/balances — get computed balances
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    await requireGroupMember(groupId);

    const balances = await computeGroupBalances(groupId);

    return NextResponse.json(balances);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    if (message === "Not a member of this group") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
