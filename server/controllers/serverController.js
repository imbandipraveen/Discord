// const Server = require("../models/Server");
const User = require("../models/User");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const Server = require("../models/Server");

exports.createServer = async (req, res) => {
  try {
    console.log(req.user, "Req.body");

    const { name, type, key, role } = req.body.server_details;
    const userId = req.user.id;
    console.log(name, userId);
    const savedServer = await Server.create({
      server_name: name,
      server_pic: req.body.server_image,
      users: [
        {
          user_name: req.user.username,
          user_profile_pic: req.user.profile_pic,
          user_tag: req.user.tag,
          user_role: role,
          user_id: userId,
        },
      ],
      // Add categories based on template...
    });

    // const savedServer = await server.save();
    console.log(savedServer, "Server");
    // Create chat collection for server
    await Chat.create({
      server_id: savedServer._id,
    });

    // Add server to user's servers list
    await User.findByIdAndUpdate(userId, {
      $push: {
        servers: {
          server_name: name,
          server_pic: req.body.server_image,
          server_role: role,
          server_id: savedServer._id,
        },
      },
    });

    res.status(200).json({
      status: 200,
      message: "Server Created",
      server: savedServer,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};

exports.getServerInfo = async (req, res) => {
  try {
    const { server_id } = req.body;
    const userId = req.user.id;

    // Check if user is member of server
    const user = await User.findOne({
      _id: userId,
      "servers.server_id": server_id,
    });

    if (!user) {
      return res.status(403).json({
        status: 403,
        message: "Not authorized",
      });
    }

    const server = await Server.findById(server_id);
    res.json(server);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

exports.addNewChannel = async (req, res) => {
  try {
    const { category_id, channel_name, channel_type, server_id } = req.body;

    // Validate input
    if (!channel_name || !channel_type || !category_id || !server_id) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
      });
    }

    const result = await Server.updateOne(
      {
        _id: new mongoose.Types.ObjectId(server_id),
        "categories._id": new mongoose.Types.ObjectId(category_id),
      },
      {
        $push: {
          "categories.$.channels": {
            channel_name,
            channel_type,
          },
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ status: 200 });
    } else {
      res.status(404).json({
        status: 404,
        message: "Server or category not found",
      });
    }
  } catch (error) {
    console.error("Add channel error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

exports.addNewCategory = async (req, res) => {
  try {
    const { category_name, server_id } = req.body;

    // Validate input
    if (!category_name || !server_id) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
      });
    }

    const result = await Server.updateOne(
      { _id: new mongoose.Types.ObjectId(server_id) },
      {
        $push: {
          categories: {
            category_name,
            channels: [],
          },
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ status: 200 });
    } else {
      res.status(404).json({
        status: 404,
        message: "Server not found",
      });
    }
  } catch (error) {
    console.error("Add category error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

exports.deleteServer = async (req, res) => {
  try {
    const { server_id } = req.body;

    // Mark server as inactive
    const serverResult = await Server.updateOne(
      { _id: server_id },
      { $set: { active: false } }
    );

    if (serverResult.modifiedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Server not found",
      });
    }

    // Remove server from all users' server lists
    const userResult = await User.updateMany(
      { "servers.server_id": server_id },
      { $pull: { servers: { server_id } } }
    );

    if (userResult.modifiedCount > 0) {
      res.json({ status: 200 });
    } else {
      res.status(404).json({
        status: 404,
        message: "No users found with this server",
      });
    }
  } catch (error) {
    console.error("Delete server error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

exports.leaveServer = async (req, res) => {
  try {
    const { server_id } = req.body;
    const user_id = req.user.id;

    // Remove server from user's server list
    const userResult = await User.updateOne(
      { _id: user_id },
      { $pull: { servers: { server_id } } }
    );

    if (userResult.modifiedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Server not found in user's list",
      });
    }

    // Remove user from server's user list
    const serverResult = await Server.updateOne(
      { _id: server_id },
      { $pull: { users: { user_id } } }
    );

    if (serverResult.modifiedCount > 0) {
      res.json({ status: 200 });
    } else {
      res.status(404).json({
        status: 404,
        message: "User not found in server",
      });
    }
  } catch (error) {
    console.error("Leave server error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
