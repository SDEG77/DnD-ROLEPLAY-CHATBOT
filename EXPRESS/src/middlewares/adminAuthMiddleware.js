const { clearAdminAuthCookies, ADMIN_AUTH_COOKIE_NAME } = require('../utils/adminAuthCookies');
const { verifyAdminSessionToken } = require('../services/adminAccessService');

async function requireAdminAuth(req, res, next) {
  try {
    const token = req.cookies?.[ADMIN_AUTH_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: 'Admin authentication is required.' });
    }

    const payload = verifyAdminSessionToken(token);
    req.admin = {
      role: payload.role,
      label: payload.label,
      keyId: payload.keyId,
    };

    return next();
  } catch (error) {
    clearAdminAuthCookies(req, res);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Admin session is invalid or expired.' });
    }

    return res.status(401).json({
      error: error.message || 'Admin authentication failed.',
    });
  }
}

module.exports = {
  requireAdminAuth,
};
