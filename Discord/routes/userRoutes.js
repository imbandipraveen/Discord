const express = require('express');
const router = express.Router();
const { getUserRelations, addFriend } = require('../controllers/userController');
const { authToken } = require('../middleware/auth');

router.use(authToken);

router.get('/relations', getUserRelations);
router.post('/add-friend', addFriend);

module.exports = router; 