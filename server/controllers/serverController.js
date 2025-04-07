// const Server = require("../models/Server");
const User = require("../models/User");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const Server = require("../models/Server");
const infoLogger = require("../utils/logger");

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
      categories: [
        {
          category_name: name,
          channels: [
            {
              channel_name: `${name}-channel`,
              channel_type: "text",
            },
          ],
        },
      ],
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

    infoLogger.info("Server created successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id: savedServer._id,
      server_name: name,
      creator_id: userId,
    });

    res.status(200).json({
      status: 200,
      message: "Server Created",
      server: savedServer,
    });
  } catch (error) {
    infoLogger.error("Server creation failed", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
};
exports.changeRole = async (req, res) => {
  try {
    const { user_id, server_id } = req.body;
    const serverData = await Server.findById(server_id);
    serverData.users = serverData.users.map((user) => {
      if (user.user_id === user_id) {
        user.user_role = user.user_role === "admin" ? "member" : "admin";
      }
      return user;
    });
    console.log(serverData);
    await serverData.save();
    infoLogger.info("User Role Changed", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id,
      removed_user_id: user_id,
    });

    res.status(200).json({
      status: 200,
      message: "user Role Changed",
    });
  } catch (err) {
    infoLogger.error("Error removing user from server", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id: req.body?.server_id,
      user_id: req.body?.user_id,
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      status: 500,
      message: "Server error",
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
      infoLogger.error("Unauthorized server access attempt", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id: userId,
        server_id,
      });

      return res.status(403).json({
        status: 403,
        message: "Not authorized",
      });
    }

    const server = await Server.findById(server_id);

    infoLogger.info("Server info retrieved", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id,
      user_id: userId,
    });

    res.json(server);
  } catch (error) {
    infoLogger.error("Error getting server info", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id: req.body?.server_id,
      user_id: req.user?.id,
      message: error.message,
      stack: error.stack,
    });

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
      infoLogger.error("Missing required fields for channel creation", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        server_id,
        category_id,
      });

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
      infoLogger.info("New channel added successfully", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        server_id,
        category_id,
        channel_name,
        channel_type,
      });
      res.json({ status: 200 });
    } else {
      infoLogger.error("Server or category not found for channel creation", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        server_id,
        category_id,
      });
      res.status(404).json({
        status: 404,
        message: "Server or category not found",
      });
    }
  } catch (error) {
    infoLogger.error("Add channel error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id: req.body?.server_id,
      category_id: req.body?.category_id,
      message: error.message,
      stack: error.stack,
    });

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
      infoLogger.error("Missing required fields for category creation", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        server_id,
      });

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
      infoLogger.info("New category added successfully", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        server_id,
        category_name,
      });

      res.json({ status: 200 });
    } else {
      infoLogger.error("Server not found for category creation", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        server_id,
      });

      res.status(404).json({
        status: 404,
        message: "Server not found",
      });
    }
  } catch (error) {
    infoLogger.error("Add category error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id: req.body?.server_id,
      message: error.message,
      stack: error.stack,
    });

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
      infoLogger.error("Server not found for deletion", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        server_id,
      });
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
      infoLogger.info("Server deleted successfully", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        server_id,
        affected_users: userResult.modifiedCount,
      });

      res.json({ status: 200 });
    } else {
      infoLogger.error("No users found with server during deletion", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        server_id,
      });

      res.status(404).json({
        status: 404,
        message: "No users found with this server",
      });
    }
  } catch (error) {
    infoLogger.error("Delete server error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id: req.body?.server_id,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const { user_id, server_id } = req.body;
    const serverData = await Server.findById(server_id);
    serverData.users = serverData.users.filter((user) => {
      if (user.user_id !== user_id) {
        return user;
      }
    });
    await serverData.save();
    const userData = await User.findById(user_id);
    console.log(userData);
    userData.servers = userData.servers.filter(
      (server) => server.server_id !== server_id
    );
    console.log(userData, "userData");
    await userData.save();

    infoLogger.info("User removed from server successfully", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id,
      removed_user_id: user_id,
    });

    res.status(200).json({
      status: 200,
      message: "user deleted from server",
    });
  } catch (err) {
    infoLogger.error("Error removing user from server", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      server_id: req.body?.server_id,
      user_id: req.body?.user_id,
      message: err.message,
      stack: err.stack,
    });

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
      infoLogger.error("Server not found in user's list when leaving", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id,
        server_id,
      });
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
      infoLogger.info("User left server successfully", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id,
        server_id,
      });
      res.json({ status: 200 });
    } else {
      infoLogger.error("User not found in server when leaving", {
        reqMethod: req.method,
        reqUrl: req.originalUrl,
        user_id,
        server_id,
      });
      res.status(404).json({
        status: 404,
        message: "User not found in server",
      });
    }
  } catch (error) {
    infoLogger.error("Leave server error", {
      reqMethod: req.method,
      reqUrl: req.originalUrl,
      user_id: req.user?.id,
      server_id: req.body?.server_id,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
