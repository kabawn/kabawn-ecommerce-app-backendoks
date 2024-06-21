const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        console.log('User not found with this ID'); // Add logging
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }
      console.log('User authenticated:', req.user); // Log the authenticated user
      next();
    } catch (error) {
      console.error('Token verification failed:', error); // Log token verification error
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('No token provided'); // Log no token case
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
    return;
  }
};

module.exports = { protect, admin };
