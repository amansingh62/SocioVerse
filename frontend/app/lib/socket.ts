let socket: WebSocket | null = null;
let isConnecting = false;

export const connectSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  if (isConnecting) {
    return socket;
  }

  isConnecting = true;

  socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:5000");

  socket.onopen = () => {
    console.log("WS connected");
    isConnecting = false;
  };

  socket.onclose = () => {
    console.log("WS disconnected");
    isConnecting = false;

    setTimeout(() => {
      connectSocket();
    }, 2000);
  };

  socket.onerror = (err) => {
    console.error("WS error", err);
  };

  return socket;
};