import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Package, TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { dataProvider } from "@/lib/dataProvider"

interface KPIs {
  stock_value: number
  ruptures_count: number
  total_products: number
  products_with_stock: number
  lots_expiring_30_days: number
  lots_expiring_90_days: number
  low_stock_products: Array<{
    id: number
    denomination: string
    stock_total: number
    stock_securite: number
  }>
  expiring_lots: Array<{
    id: number
    produit_denomination: string
    numero_lot: string
    quantite: number
    date_peremption: string
    jours_restants: number
  }>
  pending_orders: number
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
    headers: {
      ...headers,
      ...options.headers,
    },
  })
  
  if (response.status === 401) {
    window.location.reload()
    throw new Error('Non autorisé')
  }
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`)
  }
  return response.json()
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(value)
}

export const Dashboard = () => {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userServiceId, setUserServiceId] = useState<number | null>(null)
  const [userFonction, setUserFonction] = useState<string | null>(null)
  const [pendingOrders, setPendingOrders] = useState(0)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setUserServiceId(userData.service_id)
      setUserFonction(userData.fonction)
    }
  }, [])

  const canManageOrders = userFonction === 'ADMIN' || userFonction === 'PHARMACIEN'

  const fetchPendingOrders = useCallback(async () => {
    if (!canManageOrders && !userServiceId) {
      setPendingOrders(0)
      return
    }
    try {
      const filter: Record<string, any> = { statut: 'EN_ATTENTE' }
      if (!canManageOrders && userServiceId) {
        filter.service = userServiceId
      }
      const data = await dataProvider.getList('commandes', {
        pagination: { page: 1, perPage: 1 },
        filter,
      })
      setPendingOrders(data.total || 0)
    } catch {
      setPendingOrders(0)
    }
  }, [canManageOrders, userServiceId])

  useEffect(() => {
    fetchWithAuth(`${API_URL}dashboard/kpis/`)
      .then(data => {
        setKpis(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Dashboard - Erreur:', err)
        setError('Échec du chargement du tableau de bord')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchPendingOrders()
    }
  }, [loading, fetchPendingOrders])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !kpis) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Erreur lors du chargement du tableau de bord'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble du pharmacie</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardDescription>Valeur du Stock</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(kpis.stock_value)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
              Valeur totale
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="pb-2">
            <CardDescription>Ruptures</CardDescription>
            <CardTitle className="text-2xl">{kpis.ruptures_count}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
              Produits en rupture
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="pb-2">
            <CardDescription>Expirent dans 30j</CardDescription>
            <CardTitle className="text-2xl">{kpis.lots_expiring_30_days}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1 text-orange-600" />
              Lots bientôt expirés
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardDescription>Commandes en attente</CardDescription>
            <CardTitle className="text-2xl">{pendingOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Package className="h-4 w-4 mr-1 text-purple-600" />
              {canManageOrders ? 'Total' : 'Votre service'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Stock sous sécurité
            </CardTitle>
            <CardDescription>Produits dont le stock est inférieur au seuil de sécurité</CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.low_stock_products.length === 0 ? (
              <div className="flex items-center text-green-600 py-4">
                <CheckCircle className="h-5 w-5 mr-2" />
                Tous les produits sont bien approvisionnés
              </div>
            ) : (
              <div className="space-y-3">
                {kpis.low_stock_products.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div>
                      <p className="font-medium">{product.denomination}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock_total} / Sécurité: {product.stock_securite}
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              Lots expirant bientôt
            </CardTitle>
            <CardDescription>Lots qui expirent dans les 30 prochains jours</CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.expiring_lots.length === 0 ? (
              <div className="flex items-center text-green-600 py-4">
                <CheckCircle className="h-5 w-5 mr-2" />
                Aucun lot n'expire bientôt
              </div>
            ) : (
              <div className="space-y-3">
                {kpis.expiring_lots.map(lot => (
                  <div key={lot.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div>
                      <p className="font-medium">{lot.produit_denomination}</p>
                      <p className="text-sm text-muted-foreground">
                        Lot: {lot.numero_lot} • Qté: {lot.quantite}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${lot.jours_restants <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                        {lot.jours_restants}j
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Produits</CardDescription>
            <CardTitle className="text-2xl">{kpis.total_products}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Produits en stock</CardDescription>
            <CardTitle className="text-2xl">{kpis.products_with_stock}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expirent dans 90j</CardDescription>
            <CardTitle className="text-2xl">{kpis.lots_expiring_90_days}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
