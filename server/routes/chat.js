import express from 'express';
import { authToken } from '../middleware/auth.js';
import { storeMessage, getMessages } from '../controllers/chatController.js';

const router = express.Router();

router.post('/store', authToken, storeMessage);
router.post('/get', authToken, getMessages);

export default router; 