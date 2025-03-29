import User from '../models/User.js';
import { addFriendService, processFriendRequestService } from '../services/friendService.js';

export const addFriend = async (req, res) => {
  try {
    const { friend } = req.body;
    const friendLength = friend.length;
    const hashIndex = friend.indexOf("#");

    if (hashIndex === -1) {
      return res.status(400).json({ message: 'Invalid Input', status: 400 });
    }

    const name = friend.slice(0, hashIndex);
    const userTag = friend.slice(hashIndex + 1, friendLength);
    const user_id = req.user;

    const { id, username, tag, profile_pic } = user_id;

    const result = await addFriendService({
      name,
      userTag,
      user_id: { id, username, tag, profile_pic }
    });

    return res.status(result.status).json(result);
  } catch (error) {
    console.error('Add friend error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const getUserRelations = async (req, res) => {
  try {
    const user_id = req.user;
    const result = await User.find({ _id: user_id.id });
    const { incoming_reqs, outgoing_reqs, friends, servers } = result[0];
    return res.status(201).json({ incoming_reqs, outgoing_reqs, friends, servers });
  } catch (error) {
    console.error('Get user relations error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const processRequest = async (req, res) => {
  try {
    const { message, friend_data } = req.body;
    const { id, profile_pic, tag, username } = friend_data;
    const finalFriendData = {
      friend_id: id,
      friend_profile_pic: profile_pic,
      friend_tag: tag,
      friend_username: username
    };

    const user_id = req.user;

    if (message === 'Accept') {
      const result = await processFriendRequestService(user_id, finalFriendData);
      return res.status(result.status).json(result);
    }

    // Handle other actions (Ignore, Unblock, Cancel) here
    return res.status(400).json({ message: 'Invalid action', status: 400 });
  } catch (error) {
    console.error('Process request error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
}; 