import { fetchUtils } from 'ra-core'
import type { DataProvider } from 'ra-core'

const API_URL = 'http://localhost:8000/api/'

const httpClient = (url: string, options: any = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' })
  }
  const token = localStorage.getItem('access_token')
  if (token) options.headers.set('Authorization', `Bearer ${token}`)
  return fetchUtils.fetchJson(url, options)
}

export const dataProvider: DataProvider = {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 25 }
    const sortField = params.sort?.field || 'id'
    const sortOrder = params.sort?.order || 'ASC'
    
    const query: Record<string, string> = {
      page: String(page),
      page_size: String(perPage),
      ordering: sortOrder.toUpperCase() === 'DESC' ? `-${sortField}` : sortField,
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
      total: json.count !== undefined ? json.count : parseInt(headers.get('x-total-count') || '0', 10),
    }))
  },
  
  getOne: (resource, params) => {
    return httpClient(`${API_URL}${resource}/${params.id}/`).then(({ json }) => ({
      data: json,
    }))
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
    return httpClient(`${API_URL}${resource}/?${new URLSearchParams(query).toString()}`).then(({ json }) => ({
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
    return httpClient(`${API_URL}${resource}/?${new URLSearchParams(query).toString()}`).then(({ json, headers }) => ({
      data: json.results || json || [],
      total: json.count !== undefined ? json.count : parseInt(headers.get('x-total-count') || '0', 10),
    }))
  },
}
