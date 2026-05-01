const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

function hasProjectAccess(project, user) {
  if (user.role === 'admin') {
    return true;
  }

  return project.members.some((memberId) => memberId.equals(user.id)) || project.owner.equals(user.id);
}

async function buildProjectResponse(project) {
  const taskCount = await Task.countDocuments({ project: project._id });
  return {
    ...project.toJSON(),
    taskCount,
  };
}

async function validateUsers(memberIds) {
  if (!Array.isArray(memberIds)) {
    return { valid: false, message: 'memberIds must be an array' };
  }

  const uniqueIds = [...new Set(memberIds.filter(Boolean))];
  const users = await User.find({ _id: { $in: uniqueIds } });

  if (users.length !== uniqueIds.length) {
    return { valid: false, message: 'One or more selected members do not exist' };
  }

  return { valid: true, memberIds: uniqueIds };
}

exports.getProjects = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { members: req.user.id };
    const projects = await Project.find(query)
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    const formattedProjects = await Promise.all(projects.map((project) => buildProjectResponse(project)));

    return res.json({
      success: true,
      data: formattedProjects,
      message: 'Projects fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to fetch projects',
    });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description = '', memberIds = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Project name is required',
      });
    }

    const validation = await validateUsers(memberIds);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        data: {},
        message: validation.message,
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      owner: req.user.id,
      members: validation.memberIds,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    return res.status(201).json({
      success: true,
      data: await buildProjectResponse(populatedProject),
      message: 'Project created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to create project',
    });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Project not found',
      });
    }

    if (!hasProjectAccess(project, req.user)) {
      return res.status(403).json({
        success: false,
        data: {},
        message: 'You do not have access to this project',
      });
    }

    return res.json({
      success: true,
      data: await buildProjectResponse(project),
      message: 'Project fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to fetch project',
    });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          data: {},
          message: 'Project name cannot be empty',
        });
      }

      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description.trim();
    }

    if (memberIds !== undefined) {
      const validation = await validateUsers(memberIds);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          data: {},
          message: validation.message,
        });
      }

      updates.members = validation.memberIds;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Project not found',
      });
    }

    return res.json({
      success: true,
      data: await buildProjectResponse(project),
      message: 'Project updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to update project',
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Project not found',
      });
    }

    await Task.deleteMany({ project: req.params.id });

    return res.json({
      success: true,
      data: {},
      message: 'Project deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to delete project',
    });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'userId is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'User not found',
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Project not found',
      });
    }

    if (!project.members.some((memberId) => memberId.equals(userId))) {
      project.members.push(userId);
      await project.save();
    }

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    return res.json({
      success: true,
      data: await buildProjectResponse(populatedProject),
      message: 'Member added successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to add member',
    });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Project not found',
      });
    }

    project.members = project.members.filter((memberId) => !memberId.equals(req.params.userId));
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    return res.json({
      success: true,
      data: await buildProjectResponse(populatedProject),
      message: 'Member removed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to remove member',
    });
  }
};
