const {
  getPasswordValidationErrors,
  isStrongPassword,
  MIN_PASSWORD_LENGTH,
} = require('../../src/utils/passwordPolicy');

describe('passwordPolicy', () => {
  it('accepts a strong password', () => {
    expect(isStrongPassword('StrongPass123!')).toBe(true);
  });

  it('returns clear validation errors for a weak password', () => {
    const errors = getPasswordValidationErrors('short');

    expect(errors).toContain(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    expect(errors).toContain('Password must include at least one uppercase letter.');
    expect(errors).toContain('Password must include at least one number.');
  });
});
