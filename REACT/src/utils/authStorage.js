const CSRF_TOKEN_KEY = 'dnd-dm-csrf-token'

export function getStoredUser() {
  return null
}

export function storeAuthSession({ csrfToken } = {}) {
  if (csrfToken) {
    window.sessionStorage.setItem(CSRF_TOKEN_KEY, csrfToken)
  }
}

export function clearAuthSession() {
  window.sessionStorage.removeItem(CSRF_TOKEN_KEY)
}

export function getStoredCsrfToken() {
  return window.sessionStorage.getItem(CSRF_TOKEN_KEY) || ''
}
