import { create } from "zustand";

export interface NotificationItem {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  userId: string;
  username?: string;
  image?: string | null;
  postId?: string;
  commentContent?: string;
  createdAt?: string;
}

interface BackendNotification {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  postId?: string;
  createdAt?: string;
  commentContent?: string;
  comment?: {
    content: string;
  };
  actor?: {
    id: string;
    username: string;
    image?: string | null;
  };
}

interface NotificationState {
  notifications: NotificationItem[];
  setNotifications: (items: BackendNotification[]) => void;
  addNotification: (item: BackendNotification) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  setNotifications: (items) =>
    set({
      notifications: items.map((n) => ({
        id: n.id,
        type: n.type,
        userId: n.actor?.id ?? "",
        username: n.actor?.username,
        image: n.actor?.image ?? null,
        postId: n.postId,
        commentContent: n.commentContent ?? n.comment?.content,
        createdAt: n.createdAt,
      })),
    }),

  addNotification: (n) =>
    set((state) => ({
      notifications: [
        {
          id: n.id,
          type: n.type,
          userId: n.actor?.id ?? "",
          username: n.actor?.username,
          image: n.actor?.image ?? null,
          postId: n.postId,
          commentContent: n.commentContent ?? n.comment?.content,
          createdAt: n.createdAt,
        },
        ...state.notifications,
      ],
    })),
}));