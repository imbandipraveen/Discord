const Chat = require('../models/Chat');

exports.storeMessage = async (req, res) => {
  try {
    const {
      message,
      server_id,
      channel_id,
      channel_name,
      timestamp
    } = req.body;

    const chat = await Chat.findOne({ server_id });

    if (!chat) {
      return res.status(404).json({ 
        status: 404, 
        message: 'Chat not found' 
      });
    }

    const messageData = {
      content: message,
      sender_id: req.user.id,
      sender_name: req.user.username,
      sender_pic: req.user.profile_pic,
      sender_tag: req.user.tag,
      timestamp
    };

    // Add message to existing channel or create new channel
    const channelExists = chat.channels.find(c => c.channel_id === channel_id);
    
    if (channelExists) {
      await Chat.updateOne(
        { 'channels.channel_id': channel_id },
        { $push: { 'channels.$.chat_details': messageData } }
      );
    } else {
      await Chat.updateOne(
        { server_id },
        {
          $push: {
            channels: {
              channel_id,
              channel_name,
              chat_details: [messageData]
            }
          }
        }
      );
    }

    res.status(200).json({ status: 200 });
  } catch (error) {
    res.status(500).json({ 
      status: 500, 
      message: 'Server error' 
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { channel_id, server_id } = req.body;

    // Validate input
    if (!channel_id || !server_id) {
      return res.status(400).json({
        status: 400,
        message: 'Channel ID and Server ID are required'
      });
    }

    // Find chat messages using aggregation
    const chat = await Chat.aggregate([
      {
        $match: {
          server_id: server_id
        }
      },
      {
        $project: {
          channels: {
            $filter: {
              input: "$channels",
              as: "channel",
              cond: { $eq: ["$$channel.channel_id", channel_id] }
            }
          }
        }
      }
    ]);

    // Check if chat exists and has channels
    if (!chat || !chat[0] || !chat[0].channels) {
      return res.json({ chats: [] });
    }

    // If channel exists, return its chat details
    if (chat[0].channels.length > 0) {
      res.json({ 
        chats: chat[0].channels[0].chat_details 
      });
    } else {
      res.json({ chats: [] });
    }

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
}; 