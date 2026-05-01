const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/User');

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: { errors: errors.array() },
        message: errors.array()[0].msg,
      });
    }

    const { name, email, password, role = 'member' } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'An account with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
      message: 'Registration successful',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to register user',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: { errors: errors.array() },
        message: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Invalid email or password',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Invalid email or password',
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
      message: 'Login successful',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {},
      message: error.message || 'Failed to log in',
    });
  }
};
