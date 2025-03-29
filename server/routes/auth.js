import express from 'express';
import { authToken } from '../middleware/auth.js';
import { signup, signin, verify } from '../controllers/authController.js';

const router = express.Router();

router.post('/verify_route', authToken, (req, res) => {
  res.status(201).json({ message: 'authorized', status: 201 });
});

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/verify', verify);

export default router; 