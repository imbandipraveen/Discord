const express = require('express');
const router = express.Router();
const { signup, signin, verify } = require('../controllers/authController');
const { authToken } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/verify', verify);
router.post('/verify-route', authToken, (req, res) => {
  res.status(201).json({ message: 'authorized', status: 201 });
});

module.exports = router; 