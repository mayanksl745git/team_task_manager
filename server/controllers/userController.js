const User = require('../models/User');

exports.getUsers = async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: users.map((user) => user.toJSON()),
      message: 'Users fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to fetch users',
    });
  }
};
