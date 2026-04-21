import type { ServerEvent } from "../types/ws.js";
import { userSockets, conversationRooms } from "./state.js";
import { WebSocket } from "ws";

export const emitToUser = (userId: string, event: ServerEvent) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;

  const message = JSON.stringify(event);

  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
};

export const emitToConversation = (
  conversationId: string,
  event: ServerEvent
) => {
  const sockets = conversationRooms.get(conversationId);
  if (!sockets) return;

  const message = JSON.stringify(event);

  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
};