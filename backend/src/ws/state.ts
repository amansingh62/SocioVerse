import type { WSClient } from "../types/ws.js";

export const userSockets = new Map<string, Set<WSClient>>();

export const conversationRooms = new Map<string, Set<WSClient>>();