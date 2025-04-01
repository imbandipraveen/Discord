const express = require("express");
const router = express.Router();
const {
  getDirectMessages,
  markMessagesAsRead,
  getUserById,
} = require("../controllers/directMessageController");
const { authToken } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authToken);

// Direct message routes
router.get("/direct-messages/:roomId", getDirectMessages);
router.post("/mark-read", markMessagesAsRead);
router.get("/user/:userId", getUserById);

module.exports = router;
