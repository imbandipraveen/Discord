import User from '../models/User.js';

export const addFriendService = async ({ name, userTag, user_id }) => {
  try {
    const friend = await User.findOne({ username: name, tag: userTag });
    
    if (!friend) {
      return { message: 'User not found', status: 404 };
    }

    if (friend._id.toString() === user_id.id) {
      return { message: 'Cannot add yourself as a friend', status: 400 };
    }

    const user = await User.findById(user_id.id);
    
    // Check if already friends
    if (user.friends.some(f => f.friend_id.toString() === friend._id.toString())) {
      return { message: 'Already friends with this user', status: 400 };
    }

    // Check if request already sent
    if (user.outgoing_reqs.some(r => r.friend_id.toString() === friend._id.toString())) {
      return { message: 'Friend request already sent', status: 400 };
    }

    // Check if blocked
    if (user.blocked_users.includes(friend._id)) {
      return { message: 'Cannot send friend request to blocked user', status: 400 };
    }

    // Add to outgoing requests
    user.outgoing_reqs.push({
      friend_id: friend._id,
      friend_username: friend.username,
      friend_tag: friend.tag,
      friend_profile_pic: friend.profile_pic
    });

    // Add to friend's incoming requests
    friend.incoming_reqs.push({
      friend_id: user._id,
      friend_username: user.username,
      friend_tag: user.tag,
      friend_profile_pic: user.profile_pic
    });

    await user.save();
    await friend.save();

    return { message: 'Friend request sent successfully', status: 200 };
  } catch (error) {
    console.error('Add friend service error:', error);
    return { message: 'Internal server error', status: 500 };
  }
};

export const processFriendRequestService = async (user_id, friend_data) => {
  try {
    const user = await User.findById(user_id.id);
    const friend = await User.findById(friend_data.friend_id);

    if (!user || !friend) {
      return { message: 'User not found', status: 404 };
    }

    // Remove from incoming requests
    user.incoming_reqs = user.incoming_reqs.filter(
      req => req.friend_id.toString() !== friend_data.friend_id
    );

    // Remove from outgoing requests
    friend.outgoing_reqs = friend.outgoing_reqs.filter(
      req => req.friend_id.toString() !== user_id.id
    );

    // Add to friends list for both users
    user.friends.push(friend_data);
    friend.friends.push({
      friend_id: user._id,
      friend_username: user.username,
      friend_tag: user.tag,
      friend_profile_pic: user.profile_pic
    });

    await user.save();
    await friend.save();

    return { message: 'Friend request accepted', status: 200 };
  } catch (error) {
    console.error('Process friend request service error:', error);
    return { message: 'Internal server error', status: 500 };
  }
}; 