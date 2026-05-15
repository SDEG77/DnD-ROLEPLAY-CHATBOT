import { clearAuthSession, getCsrfToken, storeAuthSession } from '../utils/authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function registerUser(payload) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  storeAuthSession(data)
  return data
}

export async function loginUser(payload) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  storeAuthSession(data)
  return data
}

export async function fetchCurrentUser() {
  return request('/api/auth/me')
}

export function logoutUser() {
  return request('/api/auth/logout', {
    method: 'POST',
  }).finally(() => {
    clearAuthSession()
  })
}

async function request(path, options = {}) {
  const method = options.method || 'GET'
  const csrfToken = getCsrfToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(!['GET', 'HEAD'].includes(method) && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    const detail = [data.error, data.detail].filter(Boolean).join('\n') || 'Request failed.'
    const error = new Error(detail)
    error.status = response.status

    if (response.status === 401) {
      clearAuthSession()
    }

    throw error
  }

  return data
}
