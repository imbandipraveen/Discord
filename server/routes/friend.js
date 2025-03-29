import express from 'express';
import { authToken } from '../middleware/auth.js';
import {
  addFriend,
  getUserRelations,
  processRequest
} from '../controllers/friendController.js';

const router = express.Router();

router.post('/add', authToken, addFriend);
router.get('/relations', authToken, getUserRelations);
router.post('/process', authToken, processRequest);

export default router; 