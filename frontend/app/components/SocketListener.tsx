"use client";

import { useEffect } from "react";
import { initSocket } from "../lib/socket"; 
import { useAuthStore } from "../store/authStore"; 
import { usePostStore } from "../store/postStore";

export default function SocketListener() {
  const user = useAuthStore((s) => s.user); 

  useEffect(() => {
    if (!user) return;

    const socket = initSocket(); 
    if (!socket) return;

    const handleDelete = (postId: string) => {
      usePostStore.getState().deletePost(postId);
    };

    socket.on("post:deleted", handleDelete);

    return () => {
      socket.off("post:deleted", handleDelete);
    };
  }, [user]); 

  return null;
}