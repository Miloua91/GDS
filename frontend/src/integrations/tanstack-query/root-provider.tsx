import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
  return {
    queryClient,
  }
}

export function QueryProvider({ children, queryClient: providedClient }: { children: ReactNode; queryClient?: QueryClient }) {
  const queryClient = useMemo(() => {
    if (providedClient) return providedClient
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 10000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })
  }, [providedClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
