const DirectMessage = require("../models/DirectMessage");
const User = require("../models/User");
const infoLogger = require("../utils/logger");

exports.getDirectMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await DirectMessage.find({ room_id: roomId }).sort({
      timestamp: 1,
    });

    infoLogger.info("Direct messages retrieved successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      roomId,
      messageCount: messages.length
    });

    res.json({ messages });
  } catch (error) {
    infoLogger.error("Error retrieving direct messages", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      roomId: req.params.roomId,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: "Server error" });
  }
};

exports.getRecentConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages where the user is either sender or receiver
    const messages = await DirectMessage.aggregate([
      {
        $match: {
          $or: [{ sender_id: userId }, { receiver_id: userId }],
        },
      },
      // Group by room_id and get the latest message
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$room_id",
          latestMessage: { $first: "$$ROOT" },
          timestamp: { $max: "$timestamp" },
        },
      },
      // Sort by latest message timestamp
      {
        $sort: { timestamp: -1 },
      },
      // Limit to 10 most recent conversations
      {
        $limit: 10,
      },
    ]);

    // Extract other user IDs from the room_ids
    const conversations = await Promise.all(
      messages.map(async (item) => {
        const roomParts = item._id.split("_");
        const otherUserId =
          roomParts[0] === userId ? roomParts[1] : roomParts[0];

        // Get the other user's details
        const otherUser = await User.findById(otherUserId);

        return {
          room_id: item._id,
          friend_id: otherUserId,
          username: otherUser ? otherUser.username : "Unknown User",
          profile_pic: otherUser ? otherUser.profile_pic : null,
          tag: otherUser ? otherUser.tag : "0000",
          last_message: item.latestMessage.content,
          timestamp: item.timestamp,
          unread:
            item.latestMessage.receiver_id === userId &&
            !item.latestMessage.read
              ? true
              : false,
        };
      })
    );

    infoLogger.info("Recent conversations retrieved successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      userId,
      conversationCount: conversations.length
    });

    res.json({ conversations });
  } catch (error) {
    infoLogger.error("Error retrieving recent conversations", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      userId: req.user?.id,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ error: "Server error" });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    const roomId = [userId, friendId].sort().join("_");

    await DirectMessage.updateMany(
      { room_id: roomId, receiver_id: userId, read: false },
      { $set: { read: true } }
    );

    infoLogger.info("Messages marked as read successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      userId,
      friendId,
      roomId,
      modifiedCount: result.modifiedCount
    });

    res.json({ success: true });
  } catch (error) {
    infoLogger.error("Error marking messages as read", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      userId: req.body?.userId,
      friendId: req.body?.friendId,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const userData = await User.findById(userId);

    if (!userData) {
      infoLogger.error("User not found", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        userId
      });
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    infoLogger.info("User details retrieved successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      userId
    });

    // Return only necessary user details
    res.status(200).json({
      id: userData._id,
      username: userData.username,
      profile_pic: userData.profile_pic,
      tag: userData.tag,
    });
  } catch (error) {
    infoLogger.error("Error fetching user details", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      userId: req.params?.userId,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ message: "Server error", status: 500 });
  }
};
