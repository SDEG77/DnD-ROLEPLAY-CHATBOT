export const MIN_PASSWORD_LENGTH = 12

export const passwordRules = [
  {
    id: 'length',
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    test: (value) => value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'special',
    label: 'At least one special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
  {
    id: 'spaces',
    label: 'No spaces',
    test: (value) => !/\s/.test(value),
  },
]

export function getPasswordChecklist(password) {
  return passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(password || ''),
  }))
}

export function getPasswordValidationMessage(password) {
  const failedRules = getPasswordChecklist(password).filter((rule) => !rule.passed)

  if (failedRules.length === 0) {
    return ''
  }

  return failedRules.map((rule) => rule.label).join(', ')
}

export function isStrongPassword(password) {
  return getPasswordChecklist(password).every((rule) => rule.passed)
}
