const User = require('../models/User');
const Username = require('../models/Username');
const { generateTag } = require('../utils/helpers');

exports.getUserRelations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 404 });
    }

    const { incoming_reqs, outgoing_reqs, friends, servers } = user;
    res.status(200).json({
      incoming_reqs,
      outgoing_reqs,
      friends,
      servers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', status: 500 });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const { friend } = req.body;
    const hashIndex = friend.indexOf('#');
    
    if (hashIndex === -1) {
      return res.status(400).json({ message: 'Invalid Input', status: 400 });
    }

    const name = friend.slice(0, hashIndex);
    const userTag = friend.slice(hashIndex + 1);

    const friendUser = await User.findOne({ username: name, tag: userTag });
    if (!friendUser) {
      return res.status(404).json({ message: 'User Not found', status: 404 });
    }

    // Add friend logic here...
    // This would include checking existing relationships and updating both users

    res.status(200).json({ message: 'Friend request sent', status: 200 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', status: 500 });
  }
}; 