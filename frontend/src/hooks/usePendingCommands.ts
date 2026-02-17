import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { API_URL } from '@/lib/config'

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

export interface Commande {
  id: number
  numero_commande: string
  service: {
    id: number
    nom: string
  }
  statut: string
  priorite: string
  date_demande: string
}

interface PendingCommandsResponse {
  count: number
  results: Commande[]
}

async function fetchPendingCommands(): Promise<PendingCommandsResponse> {
  return httpClient(`${API_URL}commandes/?statut=BROUILLON&page_size=100`)
}

export function usePendingCommands(refetchInterval = 30000) {
  const [newCommands, setNewCommands] = useState<Commande[]>([])
  const previousCount = useRef<number>(0)
  const hasShownInitialToast = useRef(false)
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pending-commands'],
    queryFn: fetchPendingCommands,
    refetchInterval,
    staleTime: 10000,
  })

  useEffect(() => {
    if (data) {
      if (!hasShownInitialToast.current) {
        hasShownInitialToast.current = true
        previousCount.current = data.count
        return
      }
      
      if (data.count > previousCount.current) {
        const newCount = data.count - previousCount.current
        const newOnes = data.results.slice(0, newCount)
        setNewCommands(newOnes)
        
        if (newCount === 1) {
          toast.info(`Nouvelle commande: ${newOnes[0].numero_commande}`, {
            description: `Service: ${newOnes[0].service?.nom || 'N/A'}`,
            duration: 5000,
          })
        } else {
          toast.info(`${newCount} nouvelles commandes`, {
            description: 'De nouvelles commandes sont en attente',
            duration: 5000,
          })
        }
      }
      previousCount.current = data.count
    }
  }, [data])

  const clearNewCommands = () => setNewCommands([])

  return {
    pendingCount: data?.count ?? 0,
    pendingCommands: data?.results ?? [],
    isLoading,
    refetch,
    newCommands,
    clearNewCommands,
  }
}
