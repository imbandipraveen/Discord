const express = require("express");
const router = express.Router();
const {
  createServer,
  getServerInfo,
  addNewChannel,
  addNewCategory,
  deleteServer,
  leaveServer,
  removeUser
} = require("../controllers/serverController");
const { authToken } = require("../middleware/auth");

// router.use(authToken);

router.post("/create", authToken, createServer);
router.post("/info", authToken, getServerInfo);
router.post("/channel/new", authToken, addNewChannel);
router.post("/category/new", authToken, addNewCategory);
router.post("/delete", authToken, deleteServer);
router.post("/leave", authToken, leaveServer);
router.put("/remove", removeUser);

module.exports = router;
