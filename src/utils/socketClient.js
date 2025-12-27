import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/constant";

let socket = null;

export function getSocket(token) {
  if (socket && socket.connected) return socket;

  socket = io(API_BASE_URL, {
    transports: ["websocket"],
    auth: {
      token,
    },
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}


