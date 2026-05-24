const crypto = require('crypto');

const KEY_FILE_VERSION = 1;
const KEY_LENGTH = 32;
const ALGORITHM = 'aes-256-gcm';

function assertPassphrase(passphrase) {
  if (!passphrase || typeof passphrase !== 'string' || passphrase.trim().length < 12) {
    throw new Error('A passphrase with at least 12 characters is required.');
  }
}

function deriveKey(passphrase, salt) {
  return crypto.scryptSync(passphrase, salt, KEY_LENGTH);
}

function encryptAdminKeyPayload(payload, passphrase) {
  assertPassphrase(passphrase);

  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(passphrase, salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    version: KEY_FILE_VERSION,
    algorithm: ALGORITHM,
    kdf: 'scrypt',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

function decryptAdminKeyFile(keyFile, passphrase) {
  assertPassphrase(passphrase);

  const parsedFile = typeof keyFile === 'string' ? JSON.parse(keyFile) : keyFile;

  if (!parsedFile || parsedFile.version !== KEY_FILE_VERSION) {
    throw new Error('Unsupported admin key file version.');
  }

  if (parsedFile.algorithm !== ALGORITHM || parsedFile.kdf !== 'scrypt') {
    throw new Error('Unsupported admin key file format.');
  }

  const salt = Buffer.from(parsedFile.salt, 'base64');
  const iv = Buffer.from(parsedFile.iv, 'base64');
  const authTag = Buffer.from(parsedFile.authTag, 'base64');
  const ciphertext = Buffer.from(parsedFile.ciphertext, 'base64');
  const key = deriveKey(passphrase, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return JSON.parse(decrypted.toString('utf8'));
}

module.exports = {
  decryptAdminKeyFile,
  encryptAdminKeyPayload,
};
