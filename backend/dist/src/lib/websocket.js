import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "../config/env.js";
let io;
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: env.FRONTEND_URL,
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        const userId = socket.handshake.auth.userId;
        console.log("User connected:", socket.id, "userId:", userId);
        if (userId) {
            socket.join(`user:${userId}`);
            console.log("Joined room:", `user:${userId}`);
        }
        socket.on("disconnect", () => {
            console.log("Disconnected:", socket.id);
        });
    });
};
export const getIO = () => {
    if (!io)
        throw new Error("Socket not initialized");
    return io;
};
//# sourceMappingURL=websocket.js.map