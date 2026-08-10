const protect = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  // In development, if bypass option or session exists
  if (process.env.NODE_ENV === 'development' && req.headers['x-dev-user']) {
    return next();
  }
  return res.status(401).json({ message: 'Not authorized, please log in' });
};

module.exports = { protect };
