import { useState, useEffect, useCallback } from "react"
import { useTranslate } from "ra-core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Package, ShoppingCart, Settings, User, FileText } from "lucide-react"
import { API_URL } from "@/lib/config"

interface Journal {
  id: number
  categorie: string
  action: string
  description: string
  utilisateur: string | null
  entity_type: string | null
  entity_id: number | null
  entity_description: string | null
  ancien_statut: string | null
  nouveau_statut: string | null
  details: Record<string, any>
  date_creation: string
}

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  })
  
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
  return response.json()
}

const getCategoryIcon = (categorie: string) => {
  switch (categorie) {
    case 'COMMANDE':
      return <ShoppingCart className="h-4 w-4" />
    case 'STOCK':
      return <Package className="h-4 w-4" />
    case 'PRODUIT':
      return <Package className="h-4 w-4" />
    case 'UTILISATEUR':
      return <User className="h-4 w-4" />
    case 'SYSTEM':
      return <Settings className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getCategoryBadge = (categorie: string, translate: any) => {
  switch (categorie) {
    case 'COMMANDE':
      return <Badge className="bg-blue-500">{translate('app.journal.category.commande')}</Badge>
    case 'STOCK':
      return <Badge className="bg-green-500">{translate('app.journal.category.stock')}</Badge>
    case 'PRODUIT':
      return <Badge className="bg-purple-500">{translate('app.journal.category.produit')}</Badge>
    case 'UTILISATEUR':
      return <Badge className="bg-orange-500">{translate('app.journal.category.utilisateur')}</Badge>
    case 'SYSTEM':
      return <Badge className="bg-gray-500">{translate('app.journal.category.system')}</Badge>
    default:
      return <Badge>{categorie}</Badge>
  }
}

const getActionBadge = (action: string, translate: any) => {
  switch (action) {
    case 'CREATE':
      return <Badge variant="outline" className="text-green-600 border-green-200">{translate('app.journal.action.create')}</Badge>
    case 'UPDATE':
      return <Badge variant="outline" className="text-blue-600 border-blue-200">{translate('app.journal.action.update')}</Badge>
    case 'DELETE':
      return <Badge variant="outline" className="text-red-600 border-red-200">{translate('app.journal.action.delete')}</Badge>
    case 'VALIDATE':
      return <Badge variant="outline" className="text-green-600 border-green-200">{translate('app.journal.action.validation')}</Badge>
    case 'ANNUL':
      return <Badge variant="destructive">{translate('app.journal.action.cancellation')}</Badge>
    case 'LIVRE':
      return <Badge className="bg-green-500">{translate('app.journal.action.delivery')}</Badge>
    case 'RECEPTION':
      return <Badge className="bg-teal-500">{translate('app.journal.action.reception')}</Badge>
    default:
      return <Badge variant="outline">{action}</Badge>
  }
}

export const JournalList = () => {
  const translate = useTranslate()
  const [activeTab, setActiveTab] = useState('ALL')
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetchJournals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('page_size', '20')
      if (activeTab !== 'ALL') {
        params.append('categorie', activeTab)
      }
      if (search) {
        params.append('search', search)
      }
      
      const data = await fetchWithAuth(`${API_URL}journals/?${params}`)
      setJournals(data.results || [])
      setTotal(data.count || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, search, page])

  useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  const tabs = [
    { id: 'ALL', label: translate('ra.action.all') },
    { id: 'COMMANDE', label: translate('app.journal.category.commande') },
    { id: 'STOCK', label: translate('app.journal.category.stock') },
    { id: 'PRODUIT', label: translate('app.journal.category.produit') },
    { id: 'UTILISATEUR', label: translate('app.journal.category.utilisateur') },
  ]

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="container mx-auto p-6 space-y-4">
      <Card>
        <CardHeader className="pb-0">
          <div className="flex gap-1 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.id !== 'ALL' && getCategoryIcon(tab.id)}
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={translate('ra.action.search_placeholder')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : journals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {translate('ra.page.empty', { name: translate('app.journal.title') })}
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map((journal) => (
                <div
                  key={journal.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryBadge(journal.categorie, translate)}
                        {getActionBadge(journal.action, translate)}
                        {journal.ancien_statut && journal.nouveau_statut && (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {journal.ancien_statut} → {journal.nouveau_statut}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{journal.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {journal.utilisateur && (
                          <span>{translate('app.journal.by')} <span className="font-medium">{journal.utilisateur}</span></span>
                        )}
                        {journal.entity_description && (
                          <span>{translate('app.journal.entity')} <span className="font-medium">{journal.entity_description}</span></span>
                        )}
                        <span>{translate('app.journal.date')} {new Date(journal.date_creation).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                {translate('ra.navigation.previous')}
              </button>
              <span className="text-sm text-muted-foreground">
                {translate('ra.navigation.page')} {page} {translate('ra.action.sort')} {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                {translate('ra.navigation.next')}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
