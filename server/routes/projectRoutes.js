const express = require('express');

const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');

const router = express.Router();

router.use(auth);

router.get('/', getProjects);
router.post('/', requireRole('admin'), createProject);
router.get('/:id', getProjectById);
router.put('/:id', requireRole('admin'), updateProject);
router.delete('/:id', requireRole('admin'), deleteProject);
router.post('/:id/members', requireRole('admin'), addMember);
router.delete('/:id/members/:userId', requireRole('admin'), removeMember);

module.exports = router;
