import { clearAdminSession, getStoredAdminCsrfToken, storeAdminSession } from '../utils/adminStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function unlockAdminSession(payload) {
  const data = await request('/api/admin/session/unlock', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  storeAdminSession(data)
  return data
}

export async function fetchAdminSession() {
  const data = await request('/api/admin/session')
  storeAdminSession(data)
  return data
}

export async function fetchAdminUsers() {
  return request('/api/admin/users')
}

export async function fetchAdminMetrics() {
  return request('/api/admin/metrics')
}

export async function logoutAdminSession() {
  return request('/api/admin/logout', {
    method: 'POST',
  }).finally(() => {
    clearAdminSession()
  })
}

async function request(path, options = {}) {
  const method = options.method || 'GET'
  const csrfToken = getStoredAdminCsrfToken()
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
      clearAdminSession()
    }

    throw error
  }

  if (data?.csrfToken) {
    storeAdminSession(data)
  }

  return data
}
