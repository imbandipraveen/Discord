const express = require("express");
const router = express.Router();
const {
  getUserRelations,
  addFriend,
  removeFriend,
  blockUser,
  unblockUser,
  deleteUser,
  updateProfilePic,
  refreshToken,
  searchUsers,
} = require("../controllers/userController");
const { getUserById } = require("../controllers/directMessageController");
const { authToken } = require("../middleware/auth");

router.get("/relations", authToken, getUserRelations);
router.post("/add-friend", authToken, addFriend);
router.post("/remove-friend", authToken, removeFriend);
router.post("/block-user", authToken, blockUser);
router.post("/unblock-user", authToken, unblockUser);
router.post("/update-profile-pic", authToken, updateProfilePic);
router.get("/refresh-token", authToken, refreshToken);
router.get("/:userId", authToken, getUserById);
router.delete("/delete", deleteUser);
router.get("/search", searchUsers);

module.exports = router;
