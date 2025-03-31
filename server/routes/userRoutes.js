const express = require("express");
const router = express.Router();
const {
  getUserRelations,
  addFriend,
  removeFriend,
  blockUser,
  unblockUser,
} = require("../controllers/userController");
const { authToken } = require("../middleware/auth");

router.use(authToken);

router.get("/relations", getUserRelations);
router.post("/add-friend", addFriend);
router.post("/remove-friend", removeFriend);
router.post("/block-user", blockUser);
router.post("/unblock-user", unblockUser);

module.exports = router;
