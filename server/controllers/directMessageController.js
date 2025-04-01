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
