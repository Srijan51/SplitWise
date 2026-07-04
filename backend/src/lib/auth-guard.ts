import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * Get the current authenticated user's ID.
 * Throws if not authenticated.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

/**
 * Verify the current user is a member of the specified group.
 * Returns the membership record.
 * Throws if not a member.
 */
export async function requireGroupMember(groupId: string) {
  const userId = await requireAuth();

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });

  if (!membership) {
    throw new Error("Not a member of this group");
  }

  return { userId, membership };
}

/**
 * Verify the current user is an ADMIN of the specified group.
 */
export async function requireGroupAdmin(groupId: string) {
  const { userId, membership } = await requireGroupMember(groupId);

  if (membership.role !== "ADMIN") {
    throw new Error("Admin access required");
  }

  return { userId, membership };
}
