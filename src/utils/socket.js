import { io } from "socket.io-client";
import { getVisitorId } from "./visitor";

let socket;

export function connectSocket() {
  const token = localStorage.getItem("token");
  const visitorId = getVisitorId();
  const websiteId = window.botstackSettings?.websiteId;

  socket = io("http://localhost:3002/chat", {
    transports: ["websocket"],
    auth: { 
        token:token ? `Bearer ${token}` : null,
        visitorId,
        websiteId
      }
  });

  socket.on("connect", () => {
  console.log(" Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket error:", err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}
