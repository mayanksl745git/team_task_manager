module.exports = function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: {},
        message: 'Authentication required',
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        data: {},
        message: 'You do not have permission to access this resource',
      });
    }

    return next();
  };
};
