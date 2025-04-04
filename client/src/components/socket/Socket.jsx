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

// Add debug event listeners

socket.on("reconnect_failed", () => {
  // Force a full reconnection by creating a new socket
  socket = socketIO.connect(baseUrl, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
});

const originalEmit = socket.emit;
socket.emit = function (event, ...args) {
  return originalEmit.apply(this, [event, ...args]);
};

export default socket;
