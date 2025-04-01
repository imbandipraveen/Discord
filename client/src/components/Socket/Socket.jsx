import { useEffect } from "react";
import socketIO from "socket.io-client";

// Connect to the socket server with fixed URL for development
const baseUrl = "http://localhost:3080";

// Connect to the socket server with reconnection options
let socket = socketIO.connect(baseUrl, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

console.log("Socket.io connecting to:", baseUrl);

// Add debug event listeners
socket.on("connect", () => {
  console.log("Socket connected successfully with ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("reconnect", (attemptNumber) => {
  console.log(`Socket reconnected after ${attemptNumber} attempts`);
});

socket.on("reconnect_attempt", (attemptNumber) => {
  console.log(`Socket reconnection attempt #${attemptNumber}`);
});

socket.on("reconnect_error", (error) => {
  console.error("Socket reconnection error:", error);
});

socket.on("reconnect_failed", () => {
  console.error("Socket reconnection failed after all attempts");
  // Force a full reconnection by creating a new socket
  socket = socketIO.connect(baseUrl, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
});

// Debug wrapper for emit
const originalEmit = socket.emit;
socket.emit = function (event, ...args) {
  console.log(`Socket EMIT: ${event}`, args);
  return originalEmit.apply(this, [event, ...args]);
};

export default socket;
