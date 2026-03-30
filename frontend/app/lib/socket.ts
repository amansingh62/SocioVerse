import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

let socket: Socket | null = null;

export const initSocket = () => {
  const user = useAuthStore.getState().user;
  if (!user) return null;

  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_API_URL!, {
    auth: {
      userId: user.id,
    },
    transports: ["websocket"], 
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};