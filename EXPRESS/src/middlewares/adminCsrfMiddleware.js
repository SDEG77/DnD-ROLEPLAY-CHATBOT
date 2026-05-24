const { ADMIN_CSRF_COOKIE_NAME } = require('../utils/adminAuthCookies');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function requireAdminCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[ADMIN_CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      error: 'Admin CSRF validation failed.',
      detail: 'Missing or invalid admin CSRF token.',
    });
  }

  return next();
}

module.exports = {
  requireAdminCsrf,
};
