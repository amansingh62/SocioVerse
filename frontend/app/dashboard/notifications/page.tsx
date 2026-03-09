"use client";

import { useEffect } from "react";
import api from "@/app/lib/axios";
import {
  useNotificationStore,
  NotificationItem,
} from "@/app/store/notificationStore";
import Image from "next/image";

function timeAgo(date: string | undefined) {
  if (!date) return "";
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86400)}d ago`;
}

function buildMessage(n: NotificationItem) {
  if (n.type === "LIKE") return `${n.username} liked your post`;
  if (n.type === "COMMENT") return `${n.username} commented "${n.commentContent}"`;
  if (n.type === "FOLLOW") return `${n.username} started following you`;
  return "";
}

export default function NotificationsPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data } = await api.get("/post/notifications");
        setNotifications(data.notifications);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();
  }, [setNotifications]);

  if (!notifications.length) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 text-[#6b5c55]">
        No notifications yet
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-3">
      <h1 className="text-xl font-semibold mb-6 text-[#1c1917]">
        Notifications
      </h1>

      {notifications.map((n) => (
        <div
          key={n.id}
          className="glass-card p-4 rounded-xl flex gap-3 items-center"
        >
          <div className="w-10 h-10 flex-shrink-0">
            {n.image ? (
              <Image
                src={n.image}
                width={40}
                height={40}
                className="rounded-full object-cover"
                alt={n.username ?? "User"}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#e7d5cd] flex items-center justify-center text-sm font-medium">
                {n.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-sm text-[#1c1917]">
            {buildMessage(n)}
          </div>

          <div className="text-xs text-gray-500">
            {timeAgo(n.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}