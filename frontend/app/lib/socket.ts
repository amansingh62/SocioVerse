import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

let socket: Socket | null = null;

export const initSocket = () => {
  const user = useAuthStore.getState().user;
  if (!user) return null;

  socket = io(process.env.NEXT_PUBLIC_API_URL!, {
    auth: {
      userId: user.id,
    },
  });

  return socket;
};

export const getSocket = () => socket;
