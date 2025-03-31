const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const { connectDB } = require("./config/database");
const { connectDB } = require("./Config/database");
const { setupSocket } = require("./Config/socket");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const serverRoutes = require("./routes/serverRoutes");
const chatRoutes = require("./routes/chatRoutes");
const inviteRoutes = require("./routes/inviteRoutes");

const app = express();
const port = process.env.PORT || 3080;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Connect to database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/invites", inviteRoutes);

// Start server
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Setup Socket.io
setupSocket(server);

module.exports = app;
