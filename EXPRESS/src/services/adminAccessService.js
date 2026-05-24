const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { decryptAdminKeyFile } = require('../utils/adminKeyCrypto');

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET;
}

function getAdminKeySecret() {
  if (!process.env.ADMIN_KEY_SECRET) {
    throw new Error('ADMIN_KEY_SECRET is not configured.');
  }

  return process.env.ADMIN_KEY_SECRET;
}

function getClientOrigin() {
  return process.env.CLIENT_ORIGIN || 'http://localhost:5173';
}

function getUnlockGrantSecret() {
  return process.env.ADMIN_ENTRY_SECRET || getAdminSessionSecret();
}

function createAdminEntryGrant() {
  const secret = getUnlockGrantSecret();

  if (!secret) {
    throw new Error('ADMIN_ENTRY_SECRET or JWT_SECRET must be configured.');
  }

  return jwt.sign(
    {
      purpose: 'admin-unlock',
      nonce: crypto.randomBytes(12).toString('hex'),
    },
    secret,
    {
      expiresIn: process.env.ADMIN_ENTRY_EXPIRES_IN || '10m',
    },
  );
}

function verifyAdminEntryGrant(token) {
  const secret = getUnlockGrantSecret();

  if (!secret) {
    throw new Error('ADMIN_ENTRY_SECRET or JWT_SECRET must be configured.');
  }

  const payload = jwt.verify(token, secret);

  if (payload.purpose !== 'admin-unlock') {
    throw new Error('Invalid admin unlock grant.');
  }

  return payload;
}

function createAdminSessionToken(adminIdentity) {
  const secret = getAdminSessionSecret();

  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET or JWT_SECRET must be configured.');
  }

  return jwt.sign(
    {
      role: 'admin',
      label: adminIdentity.label,
      keyId: adminIdentity.keyId,
    },
    secret,
    {
      expiresIn: process.env.ADMIN_SESSION_EXPIRES_IN || '12h',
      subject: 'admin-owner',
    },
  );
}

function verifyAdminSessionToken(token) {
  const secret = getAdminSessionSecret();

  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET or JWT_SECRET must be configured.');
  }

  const payload = jwt.verify(token, secret);

  if (payload.role !== 'admin') {
    throw new Error('Invalid admin session.');
  }

  return payload;
}

function validateAdminKeyFile({ keyFile, passphrase }) {
  const payload = decryptAdminKeyFile(keyFile, passphrase);

  if (!payload || payload.secret !== getAdminKeySecret()) {
    throw new Error('Admin key validation failed.');
  }

  return {
    label: payload.label || 'Owner',
    keyId: payload.keyId || 'admin-owner',
    createdAt: payload.createdAt || null,
  };
}

module.exports = {
  createAdminEntryGrant,
  createAdminSessionToken,
  getClientOrigin,
  validateAdminKeyFile,
  verifyAdminEntryGrant,
  verifyAdminSessionToken,
};
