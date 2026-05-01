const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const allowedStatuses = ['todo', 'in-progress', 'done'];
const allowedPriorities = ['low', 'medium', 'high'];

function isProjectMember(project, userId) {
  return project.owner.equals(userId) || project.members.some((memberId) => memberId.equals(userId));
}

async function getPopulatedTask(taskId) {
  return Task.findById(taskId)
    .populate('project', 'name')
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email role');
}

exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;
    const query = {};

    if (req.user.role === 'member') {
      query.assignedTo = req.user.id;
    }

    if (projectId) {
      query.project = projectId;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ dueDate: 1, createdAt: -1 });

    return res.json({
      success: true,
      data: tasks.map((task) => task.toJSON()),
      message: 'Tasks fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to fetch tasks',
    });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const baseQuery = req.user.role === 'admin' ? {} : { assignedTo: req.user.id };
    const now = new Date();

    const [total, todo, inProgress, done, overdue, myTasks] = await Promise.all([
      Task.countDocuments(baseQuery),
      Task.countDocuments({ ...baseQuery, status: 'todo' }),
      Task.countDocuments({ ...baseQuery, status: 'in-progress' }),
      Task.countDocuments({ ...baseQuery, status: 'done' }),
      Task.countDocuments({
        ...baseQuery,
        dueDate: { $lt: now },
        status: { $ne: 'done' },
      }),
      Task.find({ assignedTo: req.user.id })
        .populate('project', 'name')
        .populate('assignedTo', 'name email role')
        .sort({ dueDate: 1, createdAt: -1 }),
    ]);

    return res.json({
      success: true,
      data: {
        total,
        todo,
        inProgress,
        done,
        overdue,
        myTasks: myTasks.map((task) => task.toJSON()),
      },
      message: 'Dashboard data fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description = '', projectId, assignedTo, priority = 'medium', dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Task title is required',
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'projectId is required',
      });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Invalid priority value',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Project not found',
      });
    }

    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        return res.status(404).json({
          success: false,
          data: {},
          message: 'Assigned user not found',
        });
      }

      if (!isProjectMember(project, assignedTo)) {
        return res.status(400).json({
          success: false,
          data: {},
          message: 'Assigned user must belong to the selected project',
        });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      priority,
      dueDate: dueDate || null,
    });

    return res.status(201).json({
      success: true,
      data: (await getPopulatedTask(task._id)).toJSON(),
      message: 'Task created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to create task',
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Task not found',
      });
    }

    if (req.user.role === 'member') {
      if (!task.assignedTo || !task.assignedTo.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          data: {},
          message: 'You can only update tasks assigned to you',
        });
      }

      const { status } = req.body;
      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          data: {},
          message: 'Members can only update a valid status value',
        });
      }

      task.status = status;
      await task.save();

      return res.json({
        success: true,
        data: (await getPopulatedTask(task._id)).toJSON(),
        message: 'Task status updated successfully',
      });
    }

    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          data: {},
          message: 'Task title cannot be empty',
        });
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    let targetProject = await Project.findById(task.project);
    if (projectId !== undefined) {
      targetProject = await Project.findById(projectId);
      if (!targetProject) {
        return res.status(404).json({
          success: false,
          data: {},
          message: 'Selected project not found',
        });
      }

      task.project = projectId;
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          data: {},
          message: 'Invalid status value',
        });
      }

      task.status = status;
    }

    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          data: {},
          message: 'Invalid priority value',
        });
      }

      task.priority = priority;
    }

    if (assignedTo !== undefined) {
      if (assignedTo) {
        const user = await User.findById(assignedTo);
        if (!user) {
          return res.status(404).json({
            success: false,
            data: {},
            message: 'Assigned user not found',
          });
        }

        if (!isProjectMember(targetProject, assignedTo)) {
          return res.status(400).json({
            success: false,
            data: {},
            message: 'Assigned user must belong to the selected project',
          });
        }

        task.assignedTo = assignedTo;
      } else {
        task.assignedTo = null;
      }
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    await task.save();

    return res.json({
      success: true,
      data: (await getPopulatedTask(task._id)).toJSON(),
      message: 'Task updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to update task',
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'Task not found',
      });
    }

    return res.json({
      success: true,
      data: {},
      message: 'Task deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to delete task',
    });
  }
};
