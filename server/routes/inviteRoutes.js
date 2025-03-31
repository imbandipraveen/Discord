const express = require('express');
const router = express.Router();
const { 
  createInviteLink, 
  getInviteLinkInfo, 
  acceptInvite 
} = require('../controllers/inviteController');
const { authToken } = require('../middleware/auth');

router.use(authToken);

router.post('/create', createInviteLink);
router.post('/info', getInviteLinkInfo);
router.post('/accept', acceptInvite);

module.exports = router; 