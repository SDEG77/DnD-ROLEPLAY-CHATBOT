const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { encryptAdminKeyPayload } = require('../src/utils/adminKeyCrypto');

function main() {
  const outputPathArg = process.argv[2] || './admin-owner.key.json';
  const passphrase = process.argv[3] || '';
  const label = process.argv[4] || 'Owner';
  const adminKeySecret = process.env.ADMIN_KEY_SECRET || '';

  if (!adminKeySecret) {
    throw new Error('ADMIN_KEY_SECRET must be set before generating the admin key file.');
  }

  if (!passphrase || passphrase.length < 12) {
    throw new Error('Passphrase must be provided as the second argument and be at least 12 characters long.');
  }

  const keyPayload = {
    keyId: crypto.randomUUID(),
    label,
    secret: adminKeySecret,
    createdAt: new Date().toISOString(),
  };

  const encryptedKeyFile = encryptAdminKeyPayload(keyPayload, passphrase);
  const outputPath = path.resolve(process.cwd(), outputPathArg);

  fs.writeFileSync(outputPath, `${JSON.stringify(encryptedKeyFile, null, 2)}\n`, 'utf8');

  process.stdout.write(`Admin key file created at ${outputPath}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message || 'Failed to generate admin key file.'}\n`);
  process.exitCode = 1;
}
