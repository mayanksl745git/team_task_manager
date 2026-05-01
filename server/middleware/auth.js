const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: {},
      message: 'Authentication token missing',
    });
  }

  const token = authorization.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: {},
      message: 'Invalid or expired token',
    });
  }
};
