const ADMIN_CSRF_TOKEN_KEY = 'dnd-dm-admin-csrf-token'

export function storeAdminSession({ csrfToken } = {}) {
  if (csrfToken) {
    window.sessionStorage.setItem(ADMIN_CSRF_TOKEN_KEY, csrfToken)
  }
}

export function clearAdminSession() {
  window.sessionStorage.removeItem(ADMIN_CSRF_TOKEN_KEY)
}

export function getStoredAdminCsrfToken() {
  return window.sessionStorage.getItem(ADMIN_CSRF_TOKEN_KEY) || ''
}
