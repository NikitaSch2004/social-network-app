const API_BASE = 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'social_app_token'
const USERNAME_KEY = 'social_app_username'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getCurrentUsername() {
  return localStorage.getItem(USERNAME_KEY)
}

export function setAuth(token, username) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
}

export function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  }
}

export async function apiFetch(path, options = {}) {
  const config = {
    headers: authHeaders(),
    ...options,
  }

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body)
  }

  const response = await fetch(`${API_BASE}${path}`, config)
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const error = data || { error: 'Request failed' }
    throw error
  }

  return data
}
