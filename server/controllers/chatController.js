import Chat from '../models/Chat.js';
import { storeMessageService, getMessagesService } from '../services/chatService.js';

export const storeMessage = async (req, res) => {
  try {
    const { message, server_id, channel_id, channel_name, timestamp, username, tag, id, profile_pic } = req.body;

    const response = await storeMessageService({
      message,
      server_id,
      channel_id,
      channel_name,
      timestamp,
      username,
      tag,
      id,
      profile_pic
    });

    if (response.status === 200) {
      return res.json({ status: 200 });
    }

    return res.status(400).json({ message: 'Failed to store message' });
  } catch (error) {
    console.error('Store message error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { channel_id, server_id } = req.body;
    const response = await getMessagesService(server_id, channel_id);

    if (response[0].channels.length !== 0) {
      return res.json({ chats: response[0].channels[0].chat_details });
    }

    return res.json({ chats: [] });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
}; 