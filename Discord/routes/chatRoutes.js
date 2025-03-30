const express = require('express');
const router = express.Router();
const { 
  storeMessage, 
  getMessages 
} = require('../controllers/chatController');
const { authToken } = require('../middleware/auth');

router.use(authToken);

router.post('/message', storeMessage);
router.post('/messages', getMessages);

module.exports = router; 