import { WebSocketServer } from "ws";
import { IncomingMessage, Server } from "http";
import { userSockets, conversationRooms } from "./state.js";
import type { ClientEvent, WSClient } from "../types/ws.js";
import cookie from "cookie";
import { verifyAccessToken } from "../utils/tokens.js";
import { prisma } from "../lib/prisma.js";

export const initWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WSClient, req: IncomingMessage) => {
    try {
      const cookies = cookie.parse(req.headers.cookie || "");
      const token = cookies.accessToken;

      if (!token) throw new Error("Token not found");

      const decoded = verifyAccessToken(token);
      ws.userId = decoded.userId;
    } catch (err) {
      console.error("WS Auth Error:", err);
      ws.close(1008, "Unauthorized");
      return;
    }

    if (!ws.userId) {
      ws.close(1008, "Unauthorized");
      return;
    }

    if (!userSockets.has(ws.userId)) {
      userSockets.set(ws.userId, new Set());
    }

    userSockets.get(ws.userId)!.add(ws);
    ws.rooms = new Set();

    console.log("WS connected:", ws.userId);

    ws.on("message", async (data: Buffer) => {
      try {
        const event = JSON.parse(data.toString()) as ClientEvent;

        switch (event.type) {
          case "JOIN_CONVERSATION": {
            const conversationId = event.conversationId;
            const userId = ws.userId;

            if (!conversationId || !userId) return;

            const isMember = await prisma.conversationMember.findUnique({
              where: {
                userId_conversationId: {
                  userId,
                  conversationId,
                },
              },
              select: { id: true },
            });

            if (!isMember) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "Unauthorized: not a member" },
                }),
              );

              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: { message: "Not a member" },
                }),
              );
              return;
            }

            if (ws.rooms.has(conversationId)) return;

            if (!conversationRooms.has(conversationId)) {
              conversationRooms.set(conversationId, new Set());
            }

            conversationRooms.get(conversationId)!.add(ws);
            ws.rooms.add(conversationId);
            break;
          }

          case "LEAVE_CONVERSATION": {
            const conversationId = event.conversationId;
            if (!conversationId) return;

            conversationRooms.get(conversationId)?.delete(ws);
            ws.rooms.delete(conversationId);
            break;
          }

          default:
            console.warn("Unknown WS event:", event);
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    });

    ws.on("close", () => {
      const sockets = userSockets.get(ws.userId!);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) {
          userSockets.delete(ws.userId!);
        }
      }

      for (const roomId of ws.rooms) {
        const room = conversationRooms.get(roomId);
        if (!room) continue;

        room.delete(ws);

        if (room.size === 0) {
          conversationRooms.delete(roomId);
        }
      }

      ws.rooms.clear();

      console.log("WS disconnected:", ws.userId);
    });
  });
};
