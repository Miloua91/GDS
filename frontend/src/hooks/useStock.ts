import { useQuery } from '@tanstack/react-query'

const API_URL = 'http://localhost:8000/api/'

const httpClient = (url: string, options: any = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' })
  }
  const token = localStorage.getItem('access_token')
  if (token) options.headers.set('Authorization', `Bearer ${token}`)
  return fetch(url, options).then(res => {
    if (!res.ok) throw new Error('Échec de la récupération des données')
    return res.json()
  })
}

export interface StockItem {
  id: number
  code_national: string
  code_interne: string
  denomination: string
  forme_pharmaceutique: string
  dosage: string
  dci: string
  stock_securite: number
  stock_alerte: number
  total_stock: number
  lots_count: number
}

interface StockResponse {
  results: StockItem[]
  count: number
}

export function useStock(page: number, search: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock', page, search],
    queryFn: () => 
      httpClient(`${API_URL}stock/?page=${page}&page_size=20&search=${encodeURIComponent(search)}`) as Promise<StockResponse>,
    staleTime: 30000,
  })

  return {
    stock: data?.results ?? [],
    total: data?.count ?? 0,
    isLoading,
    error,
    refetch,
  }
}
