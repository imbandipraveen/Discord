const User = require("../models/User");
const Username = require("../models/Username");
const { generateTag } = require("../utils/helpers");

exports.getUserRelations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    const { incoming_reqs, outgoing_reqs, friends, servers } = user;
    res.status(200).json({
      incoming_reqs,
      outgoing_reqs,
      friends,
      servers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const friend = req.body.friend_data;

    const userId = req.user.id; // Assuming authentication middleware sets req.user

    if (!friend) {
      return res.status(400).json({ message: "Invalid Input", status: 400 });
    }

    // const name = friend.slice(0, hashIndex);
    // const userTag = friend.slice(hashIndex + 1);

    // Find the friend user in the database
    const friendUser = await User.findOne({
      username: friend.username,
      tag: friend.tag,
    });
    if (!friendUser) {
      return res.status(404).json({ message: "User Not Found", status: 404 });
    }

    // Fetch the logged-in user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found", status: 404 });
    }

    // Check if users are already friends
    if (check_req(user.friends, friendUser._id)) {
      return res.status(400).json({ message: "Already friends", status: 400 });
    }

    // Check if the friend request has already been sent
    // console.log(user.outgoing_reqs, "=>outgoing_reqs", friendUser);
    if (check_req(user.outgoing_reqs, friendUser._id)) {
      // console.log("inside the friend request", user, friendUser);
      return res
        .status(400)
        .json({ message: "Friend request already sent", status: 400 });
    }

    // Check if the friend request was received
    if (check_req(friendUser.incoming_reqs, user._id)) {
      // If a friend request was already received, directly add both as friends
      // console.log("inside the friend request", user, friendUser);
      await add_friend(user, friendUser);
      return res
        .status(200)
        .json({ message: "Friend added successfully", status: 200 });
    }

    await User.updateOne(
      { _id: userId },
      {
        $push: {
          outgoing_reqs: {
            id: friendUser._id,
            username: friendUser.username,
            profile_pic: friendUser.profile_pic,
            tag: friendUser.tag,
            status: "outgoing",
          },
        },
      }
    );

    await User.updateOne(
      { _id: friendUser._id },
      {
        $push: {
          incoming_reqs: {
            id: user._id,
            username: user.username,
            profile_pic: user.profile_pic,
            tag: user.tag,
            status: "incoming",
          },
        },
      }
    );

    return res
      .status(200)
      .json({ message: "Friend request sent", status: 200 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", status: 500 });
  }
};

// Function to check if a request exists in an array
function check_req(list, user_id) {
  return list.some((item) => {
    return item.id.toString() === user_id.toString();
  });
}

// Function to add a friend
async function add_friend(user, friendUser) {
  const userUpdate = {
    $push: {
      friends: {
        id: friendUser._id,
        username: friendUser.username,
        profile_pic: friendUser.profile_pic,
        tag: friendUser.tag,
      },
    },
    $pull: { incoming_reqs: { id: friendUser._id } }, // Remove from incoming requests
  };

  const friendUpdate = {
    $push: {
      friends: {
        id: user._id,
        username: user.username,
        profile_pic: user.profile_pic,
        tag: user.tag,
      },
    },
    $pull: { outgoing_reqs: { id: user._id } }, // Remove from outgoing requests
  };

  // Perform both updates in parallel
  await Promise.all([
    User.updateOne({ _id: user._id }, userUpdate),
    User.updateOne({ _id: friendUser._id }, friendUpdate),
  ]);
}
