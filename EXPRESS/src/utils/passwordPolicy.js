const MIN_PASSWORD_LENGTH = 12;

function getPasswordValidationErrors(password) {
  const value = typeof password === 'string' ? password : '';
  const failures = [];

  if (value.length < MIN_PASSWORD_LENGTH) {
    failures.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }

  if (!/[a-z]/.test(value)) {
    failures.push('Password must include at least one lowercase letter.');
  }

  if (!/[A-Z]/.test(value)) {
    failures.push('Password must include at least one uppercase letter.');
  }

  if (!/\d/.test(value)) {
    failures.push('Password must include at least one number.');
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    failures.push('Password must include at least one special character.');
  }

  if (/\s/.test(value)) {
    failures.push('Password cannot contain spaces.');
  }

  return failures;
}

function isStrongPassword(password) {
  return getPasswordValidationErrors(password).length === 0;
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  getPasswordValidationErrors,
  isStrongPassword,
};
