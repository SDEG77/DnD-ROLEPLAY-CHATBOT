import { clearAuthSession, getStoredCsrfToken } from '../utils/authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function fetchCampaign(campaignId) {
  return request(`/api/campaigns/${campaignId}`)
}

export async function fetchCampaigns() {
  return request('/api/campaigns')
}

export async function createCampaign(campaignForm) {
  return request('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(campaignForm),
  })
}

export async function updateCampaign(campaignId, campaignForm) {
  return request(`/api/campaigns/${campaignId}`, {
    method: 'PUT',
    body: JSON.stringify(campaignForm),
  })
}

export async function deleteCampaign(campaignId) {
  return request(`/api/campaigns/${campaignId}`, {
    method: 'DELETE',
  })
}

export async function sendCampaignMessage(campaignId, message) {
  return request(`/api/campaigns/${campaignId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function saveInventoryItem(campaignId, inventoryForm, editingInventoryId) {
  const isEditing = Boolean(editingInventoryId)
  const path = isEditing
    ? `/api/campaigns/${campaignId}/inventory/${editingInventoryId}`
    : `/api/campaigns/${campaignId}/inventory`

  return request(path, {
    method: isEditing ? 'PUT' : 'POST',
    body: JSON.stringify({
      ...inventoryForm,
      quantity: Number(inventoryForm.quantity),
    }),
  })
}

export async function deleteInventoryItem(campaignId, itemId) {
  return request(`/api/campaigns/${campaignId}/inventory/${itemId}`, {
    method: 'DELETE',
  })
}

export async function synthesizeCampaignMessageSpeech(campaignId, messageId) {
  const csrfToken = getStoredCsrfToken()
  const response = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}/messages/${messageId}/tts`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    },
  })

  if (!response.ok) {
    let detail = 'Failed to generate speech.'

    try {
      const data = await response.json()
      detail = [data.error, data.detail].filter(Boolean).join('\n') || detail
    } catch {
      detail = response.statusText || detail
    }

    if (response.status === 401) {
      clearAuthSession()
    }

    const error = new Error(detail)
    error.status = response.status
    throw error
  }

  return response.blob()
}

async function request(path, options = {}) {
  const method = options.method || 'GET'
  const csrfToken = getStoredCsrfToken()
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

    if (data.campaign) {
      error.campaign = data.campaign
    }

    if (response.status === 401) {
      clearAuthSession()
    }

    throw error
  }

  return data
}
