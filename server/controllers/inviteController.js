const Invite = require("../models/Invite");
const User = require("../models/User");
const Server = require("../models/Server");
const { generateInviteCode } = require("../utils/helpers");
const { validateInviteData } = require("../utils/validation");

exports.createInviteLink = async (req, res) => {
  try {
    const { server_name, server_id, server_pic } = req.body;
    const inviter_id = req.user.id;
    const inviter_name = req.user.username;
    console.log(server_id, server_name, server_pic, "generate Link");
    // Validate input
    const validationError = validateInviteData({
      server_name,
      server_id,
    });
    console.log(validationError);
    if (validationError) {
      return res.status(400).json({
        status: 400,
        message: validationError,
      });
    }

    // Check if invite already exists
    const existingInvite = await User.findOne({
      _id: inviter_id,
      "invites.server_id": server_id,
    });

    if (existingInvite && existingInvite.invites.length > 0) {
      const invite = existingInvite.invites.find(
        (inv) => inv.server_id === server_id
      );
      return res.json({
        status: 200,
        invite_code: invite.invite_code,
      });
    }

    // Create new invite
    const timestamp = Date.now();
    const invite_code = generateInviteCode();

    const newInvite = new Invite({
      invite_code,
      inviter_name,
      inviter_id,
      server_name,
      server_id,
      server_pic,
      timestamp,
    });
    console.log(newInvite);
    await newInvite.save();

    // Add invite to user's invites
    await User.findByIdAndUpdate(inviter_id, {
      $push: {
        invites: {
          server_id,
          invite_code,
          timestamp,
        },
      },
    });

    res.json({
      status: 200,
      invite_code,
    });
  } catch (error) {
    console.error("Create invite error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

exports.getInviteLinkInfo = async (req, res) => {
  try {
    const { invite_link } = req.body;

    const invite = await Invite.findOne({ invite_code: invite_link });

    if (!invite) {
      return res.json({ status: 404 });
    }

    const { inviter_name, server_name, server_pic, server_id, inviter_id } =
      invite;

    res.json({
      status: 200,
      inviter_name,
      server_name,
      server_pic,
      server_id,
      inviter_id,
    });
  } catch (error) {
    console.error("Get invite info error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const { user_details, server_details } = req.body;
    const { username, tag, id, profile_pic } = user_details;
    const server_id = server_details.invite_details.server_id;

    // Check if user is already in server
    const existingMember = await User.findOne({
      _id: id,
      "servers.server_id": server_id,
    });

    if (existingMember) {
      return res.json({ status: 403 });
    }

    // Add user to server
    await Server.findByIdAndUpdate(server_id, {
      $push: {
        users: {
          user_name: username,
          user_profile_pic: profile_pic,
          user_tag: tag,
          user_role: "member",
          user_id: id,
        },
      },
    });

    // Add server to user's servers
    await User.findByIdAndUpdate(id, {
      $push: {
        servers: {
          server_name: server_details.invite_details.server_name,
          server_pic: server_details.invite_details.server_pic,
          server_role: "member",
          server_id,
        },
      },
    });

    res.json({ status: 200 });
  } catch (error) {
    console.error("Accept invite error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
