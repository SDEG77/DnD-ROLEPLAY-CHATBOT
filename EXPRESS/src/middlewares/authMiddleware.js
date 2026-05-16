const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AUTH_COOKIE_NAME, clearAuthCookies } = require('../utils/authCookies');

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured.');
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
}

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token is required.' });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.sub).select('_id name email').lean();

    if (!user) {
      clearAuthCookies(req, res);
      return res.status(401).json({ error: 'User account is no longer available.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      clearAuthCookies(req, res);
      return res.status(401).json({ error: 'Authentication token is invalid or expired.' });
    }

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      error: error.message || 'Authentication failed.',
    });
  }
}

module.exports = {
  getJwtSecret,
  requireAuth,
};
