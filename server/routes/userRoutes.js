const express = require('express');

const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { getUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/', auth, requireRole('admin'), getUsers);

module.exports = router;
