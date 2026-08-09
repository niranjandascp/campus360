import { io } from "socket.io-client";

let socket = null;

const BACKEND_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace("/api", "");

export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket) {
    socket = io(BACKEND_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to Socket.io server with ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Socket connection error:", err.message);
    });
  } else if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
