import { Server as SocketIOServer } from "socket.io";

/**
 * Get the Socket.IO server instance from the custom server.
 * Returns null if not available (e.g., during build).
 */
export function getIO(): SocketIOServer | null {
  return (globalThis as Record<string, unknown>).__io as SocketIOServer | null;
}

/**
 * Emit a real-time event to all members of a group.
 */
export function emitToGroup(
  groupId: string,
  event: string,
  data: unknown
): void {
  const io = getIO();
  if (io) {
    io.to(`group:${groupId}`).emit(event, data);
  }
}
