const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../middlewares/authMiddleware');
const { getPasswordValidationErrors } = require('../utils/passwordPolicy');
const { clearAuthCookies, setAuthCookies } = require('../utils/authCookies');

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signToken(user) {
  return jwt.sign({}, getJwtSecret(), {
    subject: String(user._id),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register(req, res) {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password || '';

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'name, email, and password are required.',
      });
    }

    const passwordErrors = getPasswordValidationErrors(password);

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        error: 'Password does not meet security requirements.',
        detail: passwordErrors.join('\n'),
      });
    }

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
    });
    setAuthCookies(res, signToken(user));

    return res.status(201).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Failed to register user:', error);

    if (error?.code === 11000) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    return res.status(500).json({
      error: 'Failed to register user.',
      detail: error.message || 'Unknown server error.',
    });
  }
}

async function login(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return res.status(400).json({
        error: 'email and password are required.',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    setAuthCookies(res, signToken(user));

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Failed to log in user:', error);
    return res.status(500).json({
      error: 'Failed to log in user.',
      detail: error.message || 'Unknown server error.',
    });
  }
}

async function getCurrentUser(req, res) {
  return res.json({ user: req.user });
}

async function logout(req, res) {
  clearAuthCookies(res);
  return res.json({ ok: true });
}

module.exports = {
  getCurrentUser,
  login,
  logout,
  register,
};
