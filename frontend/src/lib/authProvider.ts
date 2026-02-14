// src/lib/authProvider.ts
import { type AuthProvider } from 'ra-core'

const API_URL = 'http://localhost:8000/api/'

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_URL}token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) return false

    const data = await response.json()
    localStorage.setItem('access_token', data.access)
    return true
  } catch {
    return false
  }
}

const fetchUserPermissions = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}user/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (response.ok) {
      const userData = await response.json()
      localStorage.setItem('user', JSON.stringify(userData))
      if (userData.permissions) {
        localStorage.setItem('permissions', JSON.stringify(userData.permissions))
      }
    }
  } catch (error) {
    console.error('Failed to fetch user permissions:', error)
  }
}

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const response = await fetch(`${API_URL}token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) throw new Error('Invalid credentials')

    const data = await response.json()
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    
    await fetchUserPermissions(data.access)
    
    window.dispatchEvent(new Event('permissions-updated'))
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
    return Promise.resolve()
  },

  checkAuth: () =>
    localStorage.getItem('access_token') ? Promise.resolve() : Promise.reject(),

  checkError: async (error) => {
    const status = error?.status || error?.response?.status
    if (status === 401 || status === 403) {
      const refreshed = await refreshAccessToken()
      if (refreshed) return Promise.resolve()
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
      return Promise.reject()
    }
    return Promise.resolve()
  },

  getPermissions: () => {
    const permissions = localStorage.getItem('permissions')
    if (permissions) {
      return Promise.resolve(JSON.parse(permissions))
    }
    return Promise.resolve({})
  },

  getIdentity: () => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      return Promise.reject()
    }
    try {
      const user = JSON.parse(userStr)
      return Promise.resolve({
        id: user.id,
        fullName: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.username,
        username: user.username,
        email: user.email,
        fonction: user.fonction,
        service: user.service,
        service_id: user.service_id,
        role: user.role,
        avatar: null,
      })
    } catch {
      return Promise.reject()
    }
  },
}
