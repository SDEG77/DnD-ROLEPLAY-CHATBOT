import { describe, expect, it } from 'vitest'
import {
  getPasswordChecklist,
  getPasswordValidationMessage,
  isStrongPassword,
  MIN_PASSWORD_LENGTH,
} from '../../utils/passwordPolicy'

describe('passwordPolicy', () => {
  it('accepts a strong password', () => {
    expect(isStrongPassword('StrongPass123!')).toBe(true)
  })

  it('reports the failed rules for a weak password', () => {
    const checklist = getPasswordChecklist('short')

    expect(checklist.find((rule) => rule.id === 'length')?.passed).toBe(false)
    expect(checklist.find((rule) => rule.id === 'lowercase')?.passed).toBe(true)
    expect(checklist.find((rule) => rule.id === 'uppercase')?.passed).toBe(false)
    expect(getPasswordValidationMessage('short')).toContain(`At least ${MIN_PASSWORD_LENGTH} characters`)
    expect(getPasswordValidationMessage('short')).toContain('At least one uppercase letter')
  })
})
