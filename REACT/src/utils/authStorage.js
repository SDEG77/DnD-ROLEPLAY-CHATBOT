const CSRF_COOKIE_NAME = 'dnd_dm_csrf'

export function getStoredUser() {
  return null
}

export function storeAuthSession() {
  return undefined
}

export function clearAuthSession() {
  return undefined
}

export function getCsrfToken() {
  const cookieEntry = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`))

  if (!cookieEntry) {
    return ''
  }

  return decodeURIComponent(cookieEntry.split('=').slice(1).join('='))
}
