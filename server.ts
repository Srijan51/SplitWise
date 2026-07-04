import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: `http://${hostname}:${port}`,
      methods: ["GET", "POST"],
    },
    path: "/api/socketio",
  });

  // Make io accessible globally for API routes
  (globalThis as Record<string, unknown>).__io = io;

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a group room
    socket.on("join-group", (groupId: string) => {
      socket.join(`group:${groupId}`);
      console.log(`📎 ${socket.id} joined group:${groupId}`);
    });

    // Leave a group room
    socket.on("leave-group", (groupId: string) => {
      socket.leave(`group:${groupId}`);
      console.log(`📎 ${socket.id} left group:${groupId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`\n  🚀 SplitWise is running at http://${hostname}:${port}\n`);
  });
});
