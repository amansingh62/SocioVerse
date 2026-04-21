import { WebSocket } from "ws";

export interface WSClient extends WebSocket {
  userId: string;
  rooms: Set<string>;
};

export type ServerEvent =
  | {
      type: "NEW_MESSAGE";
      payload: {
        id: string;
        content: string;
        senderId: string;
        conversationId: string;
        createdAt: string;
        sender: {
          id: string;
          username: string;
          image: string | null;
        };
      };
    };

export type ClientEvent =
  | {
      type: "JOIN_CONVERSATION";
      conversationId: string;
    }
  | {
      type: "LEAVE_CONVERSATION";
      conversationId: string;
    };