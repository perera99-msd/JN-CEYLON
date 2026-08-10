const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authorized, please log in' });
    }
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User session invalid or expired' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, session error' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin rights required.' });
  }
};

module.exports = { protect, adminOnly };
