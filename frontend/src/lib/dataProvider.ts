import { fetchUtils } from 'ra-core'
import type { DataProvider } from 'ra-core'
import { API_URL } from './config'

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

const httpClient = async (url: string, options: any = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' })
  }
  const token = localStorage.getItem('access_token')
  if (token) options.headers.set('Authorization', `Bearer ${token}`)

  const response = await fetchUtils.fetchJson(url, options)

  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const newToken = localStorage.getItem('access_token')
      options.headers.set('Authorization', `Bearer ${newToken}`)
      return fetchUtils.fetchJson(url, options)
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
    window.dispatchEvent(new CustomEvent('auth-error'))
    throw new Error('Unauthorized')
  }

  return response
}

export const dataProvider: DataProvider = {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 25 }
    const sortField = params.sort?.field || 'id'
    const sortOrder = params.sort?.order || 'ASC'

    const query: Record<string, string> = {
      page: String(page),
      page_size: String(perPage),
      ordering:
        sortOrder.toUpperCase() === 'DESC' ? `-${sortField}` : sortField,
    }

    if (params.filter && Object.keys(params.filter).length > 0) {
      Object.entries(params.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'q') {
            query['search'] = String(value)
          } else {
            query[key] = String(value)
          }
        }
      })
    }

    const url = `${API_URL}${resource}/?${new URLSearchParams(query).toString()}`
    console.log('Fetching URL:', url) // Debug

    return httpClient(url).then(({ json, headers }) => ({
      data: json.results || json || [],
      total:
        json.count !== undefined
          ? json.count
          : parseInt(headers.get('x-total-count') || '0', 10),
    }))
  },

  getOne: (resource, params) => {
    return httpClient(`${API_URL}${resource}/${params.id}/`).then(
      ({ json }) => ({
        data: json,
      }),
    )
  },

  create: (resource, params) => {
    return httpClient(`${API_URL}${resource}/`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    }))
  },

  update: (resource, params) => {
    return httpClient(`${API_URL}${resource}/${params.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: json,
    }))
  },

  delete: (resource, params) => {
    return httpClient(`${API_URL}${resource}/${params.id}/`, {
      method: 'DELETE',
    }).then(() => ({
      data: params.previousData,
    }))
  },

  getMany: (resource, params) => {
    const query = {
      id__in: params.ids.join(','),
    }
    return httpClient(
      `${API_URL}${resource}/?${new URLSearchParams(query).toString()}`,
    ).then(({ json }) => ({
      data: json.results || json || [],
    }))
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 25 }
    const query: Record<string, string> = {
      [params.target]: String(params.id),
      page: String(page),
      page_size: String(perPage),
    }
    return httpClient(
      `${API_URL}${resource}/?${new URLSearchParams(query).toString()}`,
    ).then(({ json, headers }) => ({
      data: json.results || json || [],
      total:
        json.count !== undefined
          ? json.count
          : parseInt(headers.get('x-total-count') || '0', 10),
    }))
  },
}
