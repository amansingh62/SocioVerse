import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "../config/env.js";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;

  if (userId) {
    socket.join(`user:${userId}`);
  }

  socket.on("join_conversation", (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on("join_channel", (channelId: string) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};