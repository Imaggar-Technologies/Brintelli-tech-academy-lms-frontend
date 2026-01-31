import { io } from "socket.io-client";
import { getVisitorId } from "./visitor";

let socket;

export function connectSocket(token) {
  if (!token) {
    console.warn("🚫 Socket not connected: token missing");
    return null;
  }

  // 🔍 DEBUG LOG (safe)
  console.log("🔐 SOCKET TOKEN EXISTS:", !!token);
  console.log(
    "🔐 SOCKET TOKEN PREVIEW:",
    token.slice(0, 15) + "..." + token.slice(-10)
  );

  const visitorId = getVisitorId();
  const websiteId = window.botstackSettings?.websiteId;

  console.log("📡 Connecting socket with:");
  console.log("   visitorId:", visitorId);
  console.log("   websiteId:", websiteId);

  socket = io("https://back.botstaq.in", {
    transports: ["websocket"],
    auth: {
      token: `Bearer ${token}`, // ✅ correct
      visitorId,
      websiteId,
    },
  });

socket.on("connect", () => {
  if (!socket.id) return;
  console.log("✅ Socket connected with ID:", socket.id);
});


  socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}
