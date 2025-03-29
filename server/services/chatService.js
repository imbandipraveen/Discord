import Chat from '../models/Chat.js';

export const createChat = async (server_id) => {
  try {
    const addChats = new Chat({
      server_id
    });

    await addChats.save();
    return { status: 200 };
  } catch (error) {
    console.error('Create chat error:', error);
    throw error;
  }
};

export const storeMessageService = async (messageData) => {
  try {
    const { message, server_id, channel_id, channel_name, timestamp, username, tag, id, profile_pic } = messageData;

    const response = await Chat.find({ server_id, 'channels.channel_id': channel_id });

    if (response.length === 0) {
      const pushNewChannel = {
        $push: {
          channels: [{
            channel_id,
            channel_name,
            chat_details: [{
              content: message,
              sender_id: id,
              sender_name: username,
              sender_pic: profile_pic,
              sender_tag: tag,
              timestamp
            }]
          }]
        }
      };

      const result = await Chat.updateOne(
        { server_id },
        pushNewChannel
      );

      return result.modifiedCount > 0 ? { status: 200 } : { status: 400 };
    }

    const pushNewChat = {
      $push: {
        'channels.$.chat_details': [{
          content: message,
          sender_id: id,
          sender_name: username,
          sender_pic: profile_pic,
          sender_tag: tag,
          timestamp
        }]
      }
    };

    const result = await Chat.updateOne(
      { 'channels.channel_id': channel_id },
      pushNewChat
    );

    return result.modifiedCount > 0 ? { status: 200 } : { status: 400 };
  } catch (error) {
    console.error('Store message service error:', error);
    throw error;
  }
};

export const getMessagesService = async (server_id, channel_id) => {
  try {
    const result = await Chat.aggregate([
      { "$match": { "server_id": server_id } },
      {
        "$project": {
          "channels": {
            "$filter": {
              "input": "$channels",
              "as": "channel",
              "cond": { "$eq": ["$$channel.channel_id", channel_id] }
            }
          }
        }
      }
    ]);

    return result;
  } catch (error) {
    console.error('Get messages service error:', error);
    throw error;
  }
}; 