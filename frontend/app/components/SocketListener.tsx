"use client";

import { useEffect } from "react";
import { getSocket } from "../lib/socket";
import { usePostStore } from "../store/postStore";

export default function SocketListener() {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleDelete = (postId: string) => {
      usePostStore.getState().deletePost(postId);
    };

    socket.on("post:deleted", handleDelete);

    return () => {
      socket.off("post:deleted", handleDelete);
    };
  }, []);

  return null;
}