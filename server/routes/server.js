import express from 'express';
import { authToken } from '../middleware/auth.js';
import {
  createServer,
  getServerInfo,
  addNewChannel,
  addNewCategory,
  createInviteLink,
  getInviteLinkInfo,
  acceptInvite,
  deleteServer,
  leaveServer
} from '../controllers/serverController.js';

const router = express.Router();

router.post('/create', authToken, createServer);
router.post('/info', authToken, getServerInfo);
router.post('/channel', authToken, addNewChannel);
router.post('/category', authToken, addNewCategory);
router.post('/invite/create', authToken, createInviteLink);
router.post('/invite/info', authToken, getInviteLinkInfo);
router.post('/invite/accept', authToken, acceptInvite);
router.post('/delete', authToken, deleteServer);
router.post('/leave', authToken, leaveServer);

export default router; 