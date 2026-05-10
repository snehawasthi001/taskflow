import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "../../types";

let io: Server<ClientToServerEvents, ServerToClientEvents>;

export function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join project room
    socket.on("join:project", (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`[Socket] ${socket.id} joined project:${projectId}`);
    });

    socket.on("leave:project", (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Join user room for personal notifications
    socket.on("join:user", (userId) => {
      socket.join(`user:${userId}`);
    });

    // Task subscription
    socket.on("task:subscribe", (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on("task:unsubscribe", (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

// Helper functions for emitting events
export function emitTaskCreated(projectId: string, task: unknown) {
  io?.to(`project:${projectId}`).emit("task:created", task as never);
}

export function emitTaskUpdated(projectId: string, task: unknown) {
  io?.to(`project:${projectId}`).emit("task:updated", task as never);
}

export function emitTaskDeleted(projectId: string, taskId: string) {
  io?.to(`project:${projectId}`).emit("task:deleted", taskId);
}

export function emitNotification(userId: string, notification: unknown) {
  io?.to(`user:${userId}`).emit("notification:new", notification as never);
}
