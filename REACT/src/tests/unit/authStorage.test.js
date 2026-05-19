import { describe, expect, it } from 'vitest'
import {
  clearAuthSession,
  getStoredCsrfToken,
  getStoredUser,
  storeAuthSession,
} from '../../utils/authStorage'

describe('authStorage', () => {
  it('stores and clears the CSRF token in session storage', () => {
    storeAuthSession({ csrfToken: 'csrf-token-123' })

    expect(getStoredCsrfToken()).toBe('csrf-token-123')

    clearAuthSession()

    expect(getStoredCsrfToken()).toBe('')
  })

  it('returns null for stored user', () => {
    expect(getStoredUser()).toBeNull()
  })
})
