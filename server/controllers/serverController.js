import mongoose from 'mongoose';
import Server from '../models/Server.js';
import Chat from '../models/Chat.js';
import Invite from '../models/Invite.js';
import User from '../models/User.js';
import { createServerTemplate, addUserToServer, checkServerInUser } from '../services/serverService.js';
import { createChat } from '../services/chatService.js';
import { generateInviteCode } from '../utils/helpers.js';

export const createServer = async (req, res) => {
  try {
    const { name, type, key, role } = req.body.server_details;
    const user_id = req.user;

    // Create server template
    const serverTemplate = await createServerTemplate(user_id, req.body.server_details, req.body.server_image);

    // Create chat collection
    const addNewChat = await createChat(serverTemplate.server_id);

    if (addNewChat.status === 200) {
      // Add server details to user document
      const addServer = await addUserToServer(user_id.id, serverTemplate, role);

      if (addServer) {
        return res.json({ status: 200, message: 'Server Created' });
      }
    }

    return res.json({ status: 500, message: 'Something Went Wrong' });
  } catch (error) {
    console.error('Create server error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const getServerInfo = async (req, res) => {
  try {
    const { server_id } = req.body;
    const user_id = req.user;

    const response = await checkServerInUser(user_id.id, server_id);

    if (!response || response.length === 0) {
      return res.json({ status: 404, message: 'you are not authorized' });
    }

    const serverInfo = await Server.find({ _id: new mongoose.Types.ObjectId(server_id) });
    return res.json(serverInfo);
  } catch (error) {
    console.error('Get server info error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const addNewChannel = async (req, res) => {
  try {
    const { category_id, channel_name, channel_type, server_id } = req.body;
    const newChannel = {
      $push: {
        'categories.$.channels': { channel_name, channel_type }
      }
    };

    const result = await Server.updateOne(
      {
        _id: new mongoose.Types.ObjectId(server_id),
        'categories._id': new mongoose.Types.ObjectId(category_id)
      },
      newChannel
    );

    if (result.modifiedCount > 0) {
      return res.json({ status: 200 });
    }

    return res.status(400).json({ message: 'Failed to add channel' });
  } catch (error) {
    console.error('Add channel error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const addNewCategory = async (req, res) => {
  try {
    const { category_name, server_id } = req.body;
    const newCategory = {
      $push: {
        'categories': { category_name, channels: [] }
      }
    };

    const result = await Server.updateOne(
      { _id: new mongoose.Types.ObjectId(server_id) },
      newCategory
    );

    if (result.modifiedCount > 0) {
      return res.json({ status: 200 });
    }

    return res.status(400).json({ message: 'Failed to add category' });
  } catch (error) {
    console.error('Add category error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const createInviteLink = async (req, res) => {
  try {
    const { inviter_name, inviter_id, server_name, server_id, server_pic } = req.body;
    const response = await checkServerInUser(inviter_id, server_id);

    if (!response || response[0].invites === null || response[0].invites.length === 0) {
      const timestamp = Date.now();
      const invite_code = generateInviteCode();

      // Create new invite
      const newInvite = new Invite({
        invite_code,
        inviter_name,
        inviter_id,
        server_name,
        server_id,
        server_pic,
        timestamp
      });

      await newInvite.save();

      // Update user's invites
      await User.updateOne(
        { _id: new mongoose.Types.ObjectId(inviter_id) },
        {
          $push: {
            invites: [{
              server_id,
              invite_code,
              timestamp
            }]
          }
        }
      );

      return res.json({ status: 200, invite_code });
    }

    return res.json({ status: 200, invite_code: response[0].invites[0].invite_code });
  } catch (error) {
    console.error('Create invite link error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const getInviteLinkInfo = async (req, res) => {
  try {
    const { invite_link } = req.body;
    const invite = await Invite.findOne({ invite_code: invite_link });

    if (invite) {
      const { inviter_name, server_name, server_pic, server_id, inviter_id } = invite;
      return res.json({ status: 200, inviter_name, server_name, server_pic, server_id, inviter_id });
    }

    return res.json({ status: 404 });
  } catch (error) {
    console.error('Get invite link info error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { user_details, server_details } = req.body;
    const { username, tag, id, profile_pic } = user_details;
    const server_id = server_details.invite_details.server_id;

    const check_user = await checkServerInUser(id, server_id);

    if (!check_user || check_user[0].servers.length === 0) {
      const add_user = await addUserToServer(user_details, server_id);

      if (add_user) {
        const add_server = await addUserToServer(id, server_details.invite_details, 'member');
        return res.json({ status: 200 });
      }
    }

    return res.json({ status: 403 });
  } catch (error) {
    console.error('Accept invite error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const deleteServer = async (req, res) => {
  try {
    const { server_id } = req.body;

    // Set server as inactive
    await Server.updateOne(
      { _id: server_id },
      { $set: { active: false } }
    );

    // Remove server from all users
    const result = await User.updateMany(
      { 'servers.server_id': server_id },
      { $pull: { servers: { server_id } } }
    );

    if (result.modifiedCount > 0) {
      return res.json({ status: 200 });
    }

    return res.status(400).json({ message: 'Failed to delete server' });
  } catch (error) {
    console.error('Delete server error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const leaveServer = async (req, res) => {
  try {
    const { server_id } = req.body;
    const user_id = req.user;

    // Remove server from user's servers
    await User.updateOne(
      { _id: user_id.id },
      { $pull: { servers: { server_id } } }
    );

    // Remove user from server's users
    const result = await Server.updateOne(
      { _id: server_id },
      { $pull: { users: { user_id: user_id.id } } }
    );

    if (result.modifiedCount > 0) {
      return res.json({ status: 200 });
    }

    return res.status(400).json({ message: 'Failed to leave server' });
  } catch (error) {
    console.error('Leave server error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
}; 