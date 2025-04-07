const User = require("../models/User");
const Username = require("../models/Username");
const { generateTag } = require("../utils/helpers");
const DirectMessage = require("../models/DirectMessage");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const infoLogger = require("../utils/logger");

exports.getUserRelations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user and all their relations
    const user = await User.findById(userId);

    if (!user) {
      infoLogger.error("User not found when getting relations", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId
      });
      return res.status(404).json({ message: "User not found" });
    }

    // Get friend IDs
    const friendIds = user.friends.map((friend) => friend.id);

    // Fetch the most recent message for each friend
    const recentMessages = await Promise.all(
      friendIds.map(async (friendId) => {
        const roomId = [userId, friendId].sort().join("_");

        // Find the latest message in this conversation
        const latestMessage = await DirectMessage.findOne({ room_id: roomId })
          .sort({ timestamp: -1 })
          .limit(1);

        return {
          friendId,
          message: latestMessage ? latestMessage.content : null,
          timestamp: latestMessage ? latestMessage.timestamp : null,
        };
      })
    );

    // Create a map of friend ID to recent message data
    const messageMap = {};
    recentMessages.forEach((item) => {
      messageMap[item.friendId] = {
        last_message: item.message,
        last_message_timestamp: item.timestamp,
      };
    });

    // Add the recent message data to each friend
    const friendsWithMessages = user.friends.map((friend) => {
      const messageData = messageMap[friend.id] || {
        last_message: null,
        last_message_timestamp: null,
      };
      return {
        ...friend.toObject(),
        last_message: messageData.last_message,
        last_message_timestamp: messageData.last_message_timestamp,
      };
    });

    // Filter to only include friends who have message history
    const friendsWithChatHistory = friendsWithMessages.filter(
      (friend) => friend.last_message !== null
    );

    // Sort friends by most recent message timestamp (descending)
    const sortedFriends = friendsWithChatHistory.sort((a, b) => {
      const timestampA = a.last_message_timestamp || 0;
      const timestampB = b.last_message_timestamp || 0;
      return timestampB - timestampA;
    });

    infoLogger.info("User relations retrieved successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: userId,
      friend_count: user.friends.length,
      incoming_req_count: user.incoming_reqs.length,
      outgoing_req_count: user.outgoing_reqs.length
    });

    res.json({
      incoming_reqs: user.incoming_reqs,
      outgoing_reqs: user.outgoing_reqs,
      friends: user.friends,
      friends_with_messages: sortedFriends,
      blocked_users: user.blocked,
      servers: user.servers,
    });
  } catch (error) {
     infoLogger.error("Error getting user relations", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Server error" });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friend, friend_data, message } = req.body;
    console.log("frinedData", friend, "=>", friend_data, message);
    // Handle friend request actions (accept/cancel)
    if (friend_data && message) {
      const user = await User.findById(userId);
      const friendUser = await User.findById(friend_data.id);

      if (!user || !friendUser) {
        infoLogger.error("User not found when processing friend request", {
          reqMethod: req.method,
          reqUrl: req.originalUrl,
          user_id: userId,
          friend_id: friend_data?.id,
          action: message
        });
        return res.status(404).json({ message: "User not found", status: 404 });
      }

      if (message === "Accept") {
        // Add both users as friends
        await add_friend(user, friendUser);
        infoLogger.info("Friend request accepted", {
          reqMethod: req.method,
          reqUrl: req.originalUrl,
          user_id: userId,
          friend_id: friend_data.id
        });
        return res
          .status(200)
          .json({ message: "Friend request accepted", status: 200 });
      } else if (message === "Ignore" || message === "Cancel") {
        // Remove the request from both users
        await User.updateOne(
          { _id: userId },
          { $pull: { incoming_reqs: { id: friend_data.id } } }
        );
        await User.updateOne(
          { _id: friend_data.id },
          { $pull: { outgoing_reqs: { id: userId } } }
        );

        infoLogger.info("Friend request cancelled", {
          reqMethod: req.method,
          reqUrl: req.originalUrl,
          user_id: userId,
          friend_id: friend_data.id,
          action: message
        });

        return res
          .status(200)
          .json({ message: "Friend request cancelled", status: 200 });
      }
    }

    // Handle new friend request
    if (!friend) {
      infoLogger.error("Invalid friend input format", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId
      });
      return res.status(400).json({ message: "Invalid Input", status: 400 });
    }

    // Validate friend input format
    const hashIndex = friend.indexOf("#");
    if (hashIndex === -1) {
      infoLogger.error("Invalid friend input format (missing tag)", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId,
        friend_input: friend
      });
      return res.status(400).json({ message: "Invalid Input", status: 400 });
    }

    const name = friend.slice(0, hashIndex);
    const userTag = friend.slice(hashIndex + 1);

    // Find the friend user in the database
    const friendUser = await User.findOne({ username: name, tag: userTag });
    if (!friendUser) {
      infoLogger.error("Friend user not found", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId,
        searched_username: name,
        searched_tag: userTag
      });
      return res.status(404).json({ message: "User Not Found", status: 404 });
    }

    // Fetch the logged-in user
    const user = await User.findById(userId);
    if (!user) {
      infoLogger.error("Current user not found", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId
      });
      return res.status(404).json({ message: "User Not Found", status: 404 });
    }

    // Check if users are already friends
    if (check_req(user.friends, friendUser._id)) {
      infoLogger.error("Already friends", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId,
        friend_id: friendUser._id
      });
      return res.status(400).json({ message: "Already friends", status: 400 });
    }

    // Check if the friend request has already been sent
    if (check_req(user.outgoing_reqs, friendUser._id)) {
      infoLogger.error("Friend request already sent", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId,
        friend_id: friendUser._id
      });
      return res.status(400).json({
        message: "Friend request already sent",
        status: 400,
        friendUser,
      });
    }

    // Check if the friend request was received
    if (check_req(friendUser.incoming_reqs, user._id)) {
      // If a friend request was already received, directly add both as friends
      await add_friend(user, friendUser);

      infoLogger.info("Friend added (reciprocal request)", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId,
        friend_id: friendUser._id
      });

      return res.status(200).json({
        message: "Friend added successfully",
        status: 200,
      });
    }

    // Otherwise, send a friend request
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          outgoing_reqs: {
            id: friendUser._id,
            username: friendUser.username,
            profile_pic: friendUser.profile_pic,
            tag: friendUser.tag,
            status: "outgoing",
          },
        },
      }
    );
    await User.updateOne(
      { _id: friendUser._id },
      {
        $push: {
          incoming_reqs: {
            id: user._id,
            username: user.username,
            profile_pic: user.profile_pic,
            tag: user.tag,
            status: "incoming",
          },
        },
      }
    );

    infoLogger.info("Friend request sent", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: userId,
      friend_id: friendUser._id
    });

    return res.status(200).json({
      message: "Friend request sent",
      status: 200,
      receiver_id: friendUser._id,
    });
  } catch (error) {

    infoLogger.error("Add friend error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({ message: "Server error", status: 500 });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friend_id } = req.body;

    // Remove friend from both users
    await User.updateOne(
      { _id: userId },
      { $pull: { friends: { id: friend_id } } }
    );
    await User.updateOne(
      { _id: friend_id },
      { $pull: { friends: { id: userId } } }
    );

    infoLogger.info("Friend removed successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: userId,
      removed_friend_id: friend_id
    });

    res
      .status(200)
      .json({ message: "Friend removed successfully", status: 200 });
  } catch (error) {
    infoLogger.error("Remove friend error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      friend_id: req.body?.friend_id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friend_id } = req.body;

    console.log("Blocking user - userId:", userId, "friend_id:", friend_id);

    // Get the friend's details
    const friend = await User.findById(friend_id);
    if (!friend) {
      infoLogger.error("User to block not found", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId,
        friend_id
      });
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    console.log("Found friend:", friend);

    // First remove from friends if they are friends
    const updateResult = await User.updateOne(
      { _id: userId },
      {
        $pull: { friends: { id: friend_id } },
        $addToSet: {
          blocked: {
            id: friend._id,
            username: friend.username,
            tag: friend.tag,
            profile_pic: friend.profile_pic,
          },
        },
      }
    );

    console.log("Update result:", updateResult);

    // Also remove any pending requests
    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          incoming_reqs: { id: friend_id },
          outgoing_reqs: { id: friend_id },
        },
      }
    );

    // Verify the blocked user was added
    const updatedUser = await User.findById(userId);
    console.log("Updated user blocked array:", updatedUser.blocked);

    infoLogger.info("User blocked successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: userId,
      blocked_user_id: friend_id
    });

    res.status(200).json({ message: "User blocked successfully", status: 200 });
  } catch (error) {
    
    infoLogger.error("Block user error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      friend_id: req.body?.friend_id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({ message: "Server error", status: 500 });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friend_id } = req.body;

    // Get the friend's details
    const friend = await User.findById(friend_id);
    if (!friend) {
      infoLogger.error("User to unblock not found", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId,
        friend_id
      });
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    // Remove user from blocked list and add back to friends
    await User.updateOne(
      { _id: userId },
      {
        $pull: { blocked: { id: friend_id } },
        $addToSet: {
          friends: {
            id: friend._id,
            username: friend.username,
            profile_pic: friend.profile_pic,
            tag: friend.tag,
          },
        },
      }
    );

    // Also add the current user to the friend's friends list
    await User.updateOne(
      { _id: friend_id },
      {
        $addToSet: {
          friends: {
            id: userId,
            username: req.user.username,
            profile_pic: req.user.profile_pic,
            tag: req.user.tag,
          },
        },
      }
    );

    infoLogger.info("User unblocked successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: userId,
      unblocked_user_id: friend_id
    });

    res
      .status(200)
      .json({ message: "User unblocked successfully", status: 200 });
  } catch (error) {
    infoLogger.error("Unblock user error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      friend_id: req.body?.friend_id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

// Function to check if a request exists in an array
function check_req(list, user_id) {
  return list.some((item) => item.id.toString() === user_id.toString());
}

// Function to add a friend
async function add_friend(user, friendUser) {
  const userUpdate = {
    $push: {
      friends: {
        id: friendUser._id,
        username: friendUser.username,
        profile_pic: friendUser.profile_pic,
        tag: friendUser.tag,
      },
    },
    $pull: { incoming_reqs: { id: friendUser._id } }, // Remove from incoming requests
  };

  const friendUpdate = {
    $push: {
      friends: {
        id: user._id,
        username: user.username,
        profile_pic: user.profile_pic,
        tag: user.tag,
      },
    },
    $pull: { outgoing_reqs: { id: user._id } }, // Remove from outgoing requests
  };

  // Perform both updates in parallel
  await Promise.all([
    User.updateOne({ _id: user._id }, userUpdate),
    User.updateOne({ _id: friendUser._id }, friendUpdate),
  ]);
}

exports.deleteUser = async (req, res) => {
  try {
    let { email } = req.body;
    console.log(req.body, "Req.body from delete");
    let data = await User.deleteOne({ email });
    
    if (data) {
      infoLogger.info("User deleted successfully", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        email
      });
      return res.status(200).send({ message: "user removed" });
    }

    infoLogger.error("User not found for deletion", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      email
    });

    return res.status(400).send({ message: "try Again" });
  } catch (err) {
    infoLogger.error("Delete user error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      email: req.body?.email,
      error: err.message,
      stack: err.stack
    });
    return res.status(500).send({ message: err.message });
  }
};

exports.updateProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profilePicUrl } = req.body;

    if (!profilePicUrl) {
      infoLogger.error("Profile picture URL missing", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId
      });
      return res
        .status(400)
        .json({ message: "Profile picture URL is required", status: 400 });
    }

    // Update user's profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile_pic: profilePicUrl },
      { new: true }
    );

    if (!updatedUser) {
      infoLogger.error("User not found when updating profile picture", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId
      });
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    // Also update profile picture in friend lists, requests, etc.
    await Promise.all([
      // Update in friends' lists
      User.updateMany(
        { "friends.id": userId },
        { $set: { "friends.$.profile_pic": profilePicUrl } }
      ),
      // Update in incoming requests
      User.updateMany(
        { "incoming_reqs.id": userId },
        { $set: { "incoming_reqs.$.profile_pic": profilePicUrl } }
      ),
      // Update in outgoing requests
      User.updateMany(
        { "outgoing_reqs.id": userId },
        { $set: { "outgoing_reqs.$.profile_pic": profilePicUrl } }
      ),
      // Update in blocked lists
      User.updateMany(
        { "blocked.id": userId },
        { $set: { "blocked.$.profile_pic": profilePicUrl } }
      ),
    ]);

    // Generate new token with updated profile picture
    const token = jwt.sign(
      {
        id: updatedUser._id,
        username: updatedUser.username,
        tag: updatedUser.tag,
        profile_pic: profilePicUrl, // Use updated profile picture URL
        email: updatedUser.email,
      },
      config.jwtSecret,
      { expiresIn: config.jwtAccessExpiration }
    );

    infoLogger.info("Profile picture updated successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: userId
    });

    res.status(200).json({
      message: "Profile picture updated successfully",
      status: 200,
      profile_pic: profilePicUrl,
      token: token,
    });
  } catch (error) {
    infoLogger.error("Update profile picture error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the latest user data from the database
    const user = await User.findById(userId);
    if (!user) {
      infoLogger.error("User not found when refreshing token", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId
      });
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    // Generate new token with latest user data
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        tag: user.tag,
        profile_pic: user.profile_pic,
        email: user.email,
      },
      config.jwtSecret,
      { expiresIn: config.jwtAccessExpiration }
    );

    infoLogger.info("Token refreshed successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: userId
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      status: 200,
      token: token,
    });
  } catch (error) {
    infoLogger.error("Token refresh error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q) {
      infoLogger.error("Search query missing", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId
      });
      return res.status(400).json({ message: "Search query is required" });
    }

    // Find users whose username or tag matches the search query
    const users = await User.find({
      _id: { $ne: userId }, // Exclude the current user
      $or: [
        { username: { $regex: q, $options: "i" } },
        { tag: { $regex: q, $options: "i" } },
      ],
    })
      .select("username tag profile_pic id")
      .limit(10);

      infoLogger.info("User search completed", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId,
        search_query: q,
        result_count: users.length
      });

    res.json({ users });
  } catch (error) {
    infoLogger.error("Error searching users", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      search_query: req.query?.q,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Server error" });
  }
};
