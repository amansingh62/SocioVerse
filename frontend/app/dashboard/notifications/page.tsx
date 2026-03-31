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

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;

  return `${Math.floor(seconds / 86400)}d`;
}

function buildMessage(n: NotificationItem) {
  if (n.type === "LIKE") return `${n.username} liked your post`;
  if (n.type === "COMMENT")
    return `${n.username} commented "${n.commentContent}"`;
  if (n.type === "FOLLOW")
    return `${n.username} started following you`;

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
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-16 sm:py-24 text-center gap-3">
        <span className="text-5xl opacity-20">🔔</span>
        <p className="text-lg text-pink-300">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-3 sm:space-y-4">
      <h1 className="text-xl sm:text-2xl font-semibold text-black mb-3 sm:mb-4">
        Notifications
      </h1>

      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl transition-all hover:scale-[1.01] bg-[rgba(255,230,242,0.85)] border border-[rgba(224,86,164,0.25)] backdrop-blur-[20px]"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0">
            {n.image ? (
              <Image
                src={n.image}
                width={40}
                height={40}
                alt={n.username ?? "User"}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#E056A4] to-[#ff7bbd] text-white flex items-center justify-center text-xs sm:text-sm font-semibold">
                {n.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-[13px] sm:text-sm text-black truncate">
            {buildMessage(n)}
          </div>

          <div className="text-[11px] sm:text-xs text-pink-300 shrink-0">
            {timeAgo(n.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}