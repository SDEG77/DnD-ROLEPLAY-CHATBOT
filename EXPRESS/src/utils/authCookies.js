const crypto = require('crypto');

const AUTH_COOKIE_NAME = 'dnd_dm_auth';
const CSRF_COOKIE_NAME = 'dnd_dm_csrf';

function getCookieDomain() {
  return process.env.COOKIE_DOMAIN || undefined;
}

function getCookieSameSite() {
  return process.env.COOKIE_SAME_SITE || 'lax';
}

function useSecureCookies() {
  return process.env.COOKIE_SECURE === 'true';
}

function getBaseCookieOptions() {
  return {
    httpOnly: true,
    secure: useSecureCookies(),
    sameSite: getCookieSameSite(),
    domain: getCookieDomain(),
    path: '/',
  };
}

function getAuthCookieOptions() {
  return {
    ...getBaseCookieOptions(),
    maxAge: getTokenMaxAgeMs(),
  };
}

function getCsrfCookieOptions() {
  return {
    ...getBaseCookieOptions(),
    httpOnly: false,
    maxAge: getTokenMaxAgeMs(),
  };
}

function getClearCookieOptions() {
  const { maxAge, ...options } = getBaseCookieOptions();
  return options;
}

function getTokenMaxAgeMs() {
  const envValue = Number(process.env.JWT_COOKIE_MAX_AGE_MS);

  if (Number.isFinite(envValue) && envValue > 0) {
    return envValue;
  }

  return 7 * 24 * 60 * 60 * 1000;
}

function createCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setAuthCookies(res, token) {
  const csrfToken = createCsrfToken();

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());

  return csrfToken;
}

function setCsrfCookie(res) {
  const csrfToken = createCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());
  return csrfToken;
}

function clearAuthCookies(res) {
  const clearOptions = getClearCookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, clearOptions);
  res.clearCookie(CSRF_COOKIE_NAME, {
    ...clearOptions,
    httpOnly: false,
  });
}

module.exports = {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  clearAuthCookies,
  getTokenMaxAgeMs,
  setCsrfCookie,
  setAuthCookies,
};
