const express = require("express");
const router = express.Router();
const {
  getUserRelations,
  addFriend,
  removeFriend,
  blockUser,
  unblockUser,
  deleteUser,
} = require("../controllers/userController");
const { authToken } = require("../middleware/auth");

router.get("/relations", authToken, getUserRelations);
router.post("/add-friend", authToken, addFriend);
router.post("/remove-friend", authToken, removeFriend);
router.post("/block-user", authToken, blockUser);
router.post("/unblock-user", authToken, unblockUser);
router.delete("/delete", deleteUser);

module.exports = router;
