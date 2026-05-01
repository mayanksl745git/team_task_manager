const express = require('express');

const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const {
  getTasks,
  getDashboard,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.use(auth);

router.get('/', getTasks);
router.get('/dashboard', getDashboard);
router.post('/', requireRole('admin'), createTask);
router.put('/:id', updateTask);
router.delete('/:id', requireRole('admin'), deleteTask);

module.exports = router;
