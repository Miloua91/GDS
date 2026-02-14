import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, XCircle, Clock, Package, Loader2 } from "lucide-react"
import { dataProvider } from "@/lib/dataProvider"

interface Commande {
  id: number
  numero_commande: string
  service: number
  service_nom: string
  statut: string
  priorite: string
  date_demande: string
  lignes: Array<{
    id: number
    produit: number
    produit_denomination: string
    quantite_demandee: number
    quantite_livree: number
  }>
}

const API_URL = 'http://localhost:8000/api/'

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

const getStatusBadge = (statut: string) => {
  switch (statut) {
    case 'EN_ATTENTE':
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>
    case 'VALIDEE':
      return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle className="h-3 w-3 mr-1" /> Validée</Badge>
    case 'EN_COURS':
      return <Badge className="bg-orange-500 hover:bg-orange-600"><Package className="h-3 w-3 mr-1" /> En cours</Badge>
    case 'LIVREE':
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Livrée</Badge>
    case 'ANNULEE':
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Annulée</Badge>
    default:
      return <Badge>{statut}</Badge>
  }
}

const getPriorityBadge = (priorite: string) => {
  switch (priorite) {
    case 'URGENTE':
      return <Badge variant="destructive">Urgente</Badge>
    case 'HAUTE':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Haute</Badge>
    case 'NORMALE':
      return <Badge variant="outline">Normale</Badge>
    case 'BASSE':
      return <Badge variant="outline" className="bg-gray-100">Basse</Badge>
    default:
      return <Badge variant="outline">{priorite}</Badge>
  }
}

export const CommandeList = () => {
  const [activeTab, setActiveTab] = useState('EN_ATTENTE')
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({
    EN_ATTENTE: 0,
    VALIDEE: 0,
    EN_COURS: 0,
    LIVREE: 0,
    ANNULEE: 0,
  })
  const [userFonction, setUserFonction] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setUserFonction(userData.fonction)
    }
  }, [])

  const canManageOrders = userFonction === 'ADMIN' || userFonction === 'PHARMACIEN'

  const fetchCounts = useCallback(async () => {
    const statuses = ['EN_ATTENTE', 'VALIDEE', 'EN_COURS', 'LIVREE', 'ANNULEE']
    const newCounts: Record<string, number> = {}
    
    for (const status of statuses) {
      try {
        const data = await dataProvider.getList('commandes', {
          pagination: { page: 1, perPage: 1 },
          filter: { statut: status },
        })
        newCounts[status] = data.total || 0
      } catch {
        newCounts[status] = 0
      }
    }
    
    setCounts(newCounts)
  }, [])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  const fetchCommandes = useCallback(async () => {
    setLoading(true)
    try {
      const filter = activeTab === 'ALL' ? {} : { statut: activeTab }
      const data = await dataProvider.getList('commandes', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'date_demande', order: 'DESC' },
        filter,
      })
      setCommandes(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchCommandes()
  }, [fetchCommandes])

  const updateStatus = async (id: number, newStatut: string) => {
    setUpdating(id)
    try {
      if (newStatut === 'LIVREE') {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${API_URL}commandes/livrer/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ commande_id: id }),
        })
        if (!response.ok) {
          throw new Error('Échec de la livraison de la commande')
        }
      } else {
        await dataProvider.update('commandes', {
          id,
          data: { statut: newStatut },
          previousData: {},
        })
      }
      fetchCommandes()
      fetchCounts()
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const tabs = [
    { id: 'EN_ATTENTE', label: 'En attente' },
    { id: 'VALIDEE', label: 'Validées' },
    { id: 'EN_COURS', label: 'En cours' },
    { id: 'LIVREE', label: 'Livrées' },
    { id: 'ANNULEE', label: 'Annulées' },
  ]

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Suivi des Commandes</h1>
      <Card>
        <CardHeader className="pb-0">
          <div className="flex gap-1 border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {counts[tab.id] > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {counts[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : commandes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune commande dans cette catégorie
            </div>
          ) : (
            <div className="space-y-3">
              {commandes.map((commande) => (
                <div
                  key={commande.id}
                  className="border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between p-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-lg">{commande.numero_commande}</span>
                      {getStatusBadge(commande.statut)}
                      {getPriorityBadge(commande.priorite)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {canManageOrders && (
                        <>
                          {commande.statut === 'EN_ATTENTE' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                onClick={() => updateStatus(commande.id, 'VALIDEE')}
                                disabled={updating === commande.id}
                              >
                                {updating === commande.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => updateStatus(commande.id, 'ANNULEE')}
                                disabled={updating === commande.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Annuler
                              </Button>
                            </>
                          )}
                          
                          {commande.statut === 'VALIDEE' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                                onClick={() => updateStatus(commande.id, 'EN_COURS')}
                                disabled={updating === commande.id}
                              >
                                <Package className="h-4 w-4 mr-1" />
                                En cours
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => updateStatus(commande.id, 'ANNULEE')}
                                disabled={updating === commande.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Annuler
                              </Button>
                            </>
                          )}
                          
                          {commande.statut === 'EN_COURS' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateStatus(commande.id, 'LIVREE')}
                              disabled={updating === commande.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Livrer
                            </Button>
                          )}
                        </>
                      )}
                      
                      {commande.statut === 'LIVREE' && (
                        <span className="text-sm text-muted-foreground">
                          Livrée - Ne peut plus être modifiée
                        </span>
                      )}
                      
                      {commande.statut === 'ANNULEE' && (
                        <span className="text-sm text-muted-foreground">
                          Annulée
                        </span>
                      )}
                      
                      {commande.statut === 'EN_ATTENTE' && !canManageOrders && (
                        <span className="text-sm text-muted-foreground">
                          En attente de validation
                        </span>
                      )}
                      
                      {commande.statut === 'VALIDEE' && !canManageOrders && (
                        <span className="text-sm text-muted-foreground">
                          Validée - En attente de livraison
                        </span>
                      )}
                      
                      {commande.statut === 'EN_COURS' && !canManageOrders && (
                        <span className="text-sm text-muted-foreground">
                          En cours de préparation
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Service: <span className="font-medium text-foreground">{commande.service_nom}</span>
                      </span>
                      <span>•</span>
                      <span>Demandé le: {new Date(commande.date_demande).toLocaleDateString('fr-FR', { 
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}</span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium mb-2">Produits commandés ({commande.lignes?.length || 0})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {commande.lignes?.map((ligne) => (
                          <div key={ligne.id} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                            <span>{ligne.produit_denomination}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Qté: {ligne.quantite_demandee}
                              </Badge>
                              {ligne.quantite_livree > 0 && (
                                <Badge className="bg-green-100 text-green-800">
                                  Livré: {ligne.quantite_livree}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
