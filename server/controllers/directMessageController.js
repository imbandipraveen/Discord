const DirectMessage = require("../models/DirectMessage");
const User = require("../models/User");

exports.getDirectMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await DirectMessage.find({ room_id: roomId }).sort({
      timestamp: 1,
    });
    res.json({ messages });
  } catch (error) {
    console.error("Error retrieving direct messages:", error);
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

    res.json({ conversations });
  } catch (error) {
    console.error("Error retrieving recent conversations:", error);
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

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    // Return only necessary user details
    res.status(200).json({
      id: userData._id,
      username: userData.username,
      profile_pic: userData.profile_pic,
      tag: userData.tag,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error", status: 500 });
  }
};
