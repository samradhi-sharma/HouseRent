const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;
  console.log('Auth middleware called for:', req.originalUrl);
  
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted from authorization header');
    } else {
      console.log('No authorization header or Bearer token found');
    }

    // Make sure token exists
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to access this route - no token provided' 
      });
    }

    // Verify JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    console.log('Verifying token...');
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, decoded:', decoded);

    if (!decoded.id) {
      console.log('Token does not contain user ID');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    console.log('User authenticated:', user.id, user.role);
    req.user = user;

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    
    // Handle different types of JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed - ' + err.message
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User has no role assigned'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

// Middleware to check if owner is approved (for owner-specific routes)
exports.requireApprovedOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'This route is only accessible to property owners'
    });
  }
  
  if (!req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your owner account is pending approval. Please wait for an administrator to approve your account.'
    });
  }
  
  next();
}; 