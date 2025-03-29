import mongoose from 'mongoose';
import Server from '../models/Server.js';
import User from '../models/User.js';

export const createServerTemplate = async (user_details, server_details, image) => {
  try {
    const { name, type, key, role } = server_details;
    const { id, username, tag, profile_pic } = user_details;

    let serverTemplate;

    if (key === 2) {
      serverTemplate = new Server({
        server_name: name,
        server_pic: image,
        users: [{
          user_name: username,
          user_profile_pic: profile_pic,
          user_tag: tag,
          user_role: role,
          user_id: id
        }],
        categories: [{
          category_name: 'Text Channels',
          channels: [
            { channel_name: 'general', channel_type: 'text' },
            { channel_name: 'Clips and Highlights', channel_type: 'text' }
          ]
        },
        {
          category_name: 'Voice Channels',
          channels: [
            { channel_name: 'Lobby', channel_type: 'voice' },
            { channel_name: 'Gaming', channel_type: 'voice' }
          ]
        }]
      });
    } else if (key === 3) {
      serverTemplate = new Server({
        server_name: name,
        server_pic: image,
        users: [{
          user_name: username,
          user_profile_pic: profile_pic,
          user_tag: tag,
          user_role: role,
          user_id: id
        }],
        categories: [{
          category_name: 'INFORMATION',
          channels: [
            { channel_name: 'welcome and rules', channel_type: 'text' },
            { channel_name: 'announcements', channel_type: 'text' },
            { channel_name: 'resources', channel_type: 'text' },
            { channel_name: 'qwerty', channel_type: 'text' }
          ]
        },
        {
          category_name: 'Voice Channels',
          channels: [
            { channel_name: 'Lounge', channel_type: 'voice' },
            { channel_name: 'Meeting Room 1', channel_type: 'voice' },
            { channel_name: 'Meeting Room 2', channel_type: 'voice' }
          ]
        },
        {
          category_name: 'TEXT CHANNELS',
          channels: [
            { channel_name: 'general', channel_type: 'text' },
            { channel_name: 'meeting-plan', channel_type: 'text' },
            { channel_name: 'off-topic', channel_type: 'text' }
          ]
        }]
      });
    } else {
      serverTemplate = new Server({
        server_name: name,
        server_pic: image,
        users: [{
          user_name: username,
          user_profile_pic: profile_pic,
          user_tag: tag,
          user_role: role,
          user_id: id
        }],
        categories: [{
          category_name: 'Text Channels',
          channels: [{ channel_name: 'general', channel_type: 'text' }]
        },
        {
          category_name: 'Voice Channels',
          channels: [{ channel_name: 'general', channel_type: 'voice' }]
        }]
      });
    }

    const savedServer = await serverTemplate.save();
    return {
      server_name: name,
      server_pic: image,
      server_id: savedServer._id
    };
  } catch (error) {
    console.error('Create server template error:', error);
    throw error;
  }
};

export const addUserToServer = async (user_details, server_id) => {
  try {
    const { username, tag, id, profile_pic } = user_details;

    const newUserToServer = {
      $push: {
        users: [{
          user_name: username,
          user_profile_pic: profile_pic,
          user_tag: tag,
          user_role: 'member',
          user_id: id
        }]
      }
    };

    const result = await Server.updateOne(
      { _id: server_id },
      newUserToServer
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Add user to server error:', error);
    throw error;
  }
};

export const checkServerInUser = async (id, server_id) => {
  try {
    const result = await User.aggregate([
      { "$match": { "_id": new mongoose.Types.ObjectId(id) } },
      {
        "$project": {
          "servers": {
            "$filter": {
              "input": "$servers",
              "as": "server",
              "cond": { "$eq": ["$$server.server_id", server_id] }
            }
          }
        }
      }
    ]);

    return result;
  } catch (error) {
    console.error('Check server in user error:', error);
    throw error;
  }
}; 