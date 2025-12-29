import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/constant";

let socket = null;

export function getSocket(token) {
  if (socket && socket.connected) return socket;

  // In production, prefer polling first if WebSocket fails repeatedly
  // Check if we're in production (HTTPS or non-localhost)
  const isProduction = window.location.protocol === 'https:' || 
                       (!window.location.hostname.includes('localhost') && 
                        !window.location.hostname.includes('127.0.0.1'));

  // Try WebSocket first, but allow immediate fallback to polling
  socket = io(API_BASE_URL, {
    transports: ["polling", "websocket"], // Try polling first, then upgrade to WebSocket
    upgrade: true, // Allow transport upgrades
    rememberUpgrade: false, // Don't remember upgrades in case of issues
    auth: {
      token,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity, // Keep trying to reconnect
    timeout: 20000,
    forceNew: false, // Reuse existing connection if available
  });

  // Add comprehensive error handling
  socket.on("connect_error", (error) => {
    console.error("[Socket.IO] Connection error:", error);
    
    // If WebSocket fails, force polling
    if (error.message && error.message.includes('websocket')) {
      console.warn("[Socket.IO] WebSocket failed, forcing polling transport");
      socket.io.opts.transports = ["polling"];
    }
  });

  socket.on("disconnect", (reason) => {
    console.warn("[Socket.IO] Disconnected:", reason);
    
    // If disconnected due to transport error, try polling
    if (reason === "transport error" || reason === "transport close") {
      console.warn("[Socket.IO] Transport error, will retry with polling");
    }
  });

  socket.on("connect", () => {
    console.log("[Socket.IO] Connected with transport:", socket.io.engine.transport.name);
  });

  // Handle reconnection attempts
  socket.io.on("reconnect_attempt", (attemptNumber) => {
    console.log("[Socket.IO] Reconnection attempt:", attemptNumber);
    
    // After 3 failed attempts, force polling
    if (attemptNumber >= 3 && socket.io.opts.transports.includes("websocket")) {
      console.warn("[Socket.IO] Multiple reconnection failures, forcing polling");
      socket.io.opts.transports = ["polling"];
    }
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}




