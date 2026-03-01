import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Warehouse,
} from 'lucide-react'
import { dataProvider } from '@/lib/dataProvider'
import { useTranslate } from 'ra-core'
import { API_URL } from '@/lib/config'

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

interface MagazineOrder {
  id: number
  numero_commande: string
  service_nom: string
  statut: string
  priorite: string
  date_demande: string
}

interface MagazineOrders {
  id: number
  nom: string
  type_magasin: string
  pending_count: number
  in_progress_count: number
  delivered_count: number
  total_count: number
  pending_orders: MagazineOrder[]
  services_count: number
}

interface MagazineOrdersResponse {
  magasins: MagazineOrders[]
  totals: {
    pending: number
    in_progress: number
    delivered: number
    total: number
  }
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
  const translate = useTranslate()
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [magazineOrders, setMagazineOrders] = useState<MagazineOrdersResponse | null>(null)
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

  const canManageOrders =
    userFonction === 'ADMIN' || userFonction === 'PHARMACIEN'

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
      .then((data) => {
        setKpis(data)
        setLoading(false)
      })
      .catch((err) => {
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

  useEffect(() => {
    fetchWithAuth(`${API_URL}dashboard/magasins-orders/`)
      .then((data) => {
        setMagazineOrders(data)
      })
      .catch((err) => {
        console.error('Dashboard - Erreur magazines:', err)
      })
  }, [])

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
            <p className="text-destructive">
              {error || 'Erreur lors du chargement du tableau de bord'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {translate('app.dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {translate('app.dashboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardDescription>
              {translate('app.dashboard.stock_value')}
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(kpis.stock_value)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
              {translate('ra.sort.ascending')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="pb-2">
            <CardDescription>
              {translate('app.dashboard.ruptures')}
            </CardDescription>
            <CardTitle className="text-2xl">{kpis.ruptures_count}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
              {translate('ra.sort.descending')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="pb-2">
            <CardDescription>
              {translate('app.dashboard.expiring_30_days')}
            </CardDescription>
            <CardTitle className="text-2xl">
              {kpis.lots_expiring_30_days}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1 text-orange-600" />
              {translate('ra.sort.ascending')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardDescription>
              {translate('app.dashboard.pending_orders')}
            </CardDescription>
            <CardTitle className="text-2xl">{pendingOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Package className="h-4 w-4 mr-1 text-purple-600" />
              {canManageOrders
                ? translate('ra.action.save')
                : translate('app.stock.product')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              {translate('app.dashboard.low_stock')
                .split(' ')
                .slice(0, 4)
                .join(' ')}
            </CardTitle>
            <CardDescription>
              {translate('app.dashboard.low_stock')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.low_stock_products.length === 0 ? (
              <div className="flex items-center text-green-600 py-4">
                <CheckCircle className="h-5 w-5 mr-2" />
                {translate('ra.page.empty', { name: '' })}
              </div>
            ) : (
              <div className="space-y-3">
                {kpis.low_stock_products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{product.denomination}</p>
                      <p className="text-sm text-muted-foreground">
                        {translate('app.stock.current_stock')}:{' '}
                        {product.stock_total} /{' '}
                        {translate('app.stock.security')}:{' '}
                        {product.stock_securite}
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
              {translate('app.dashboard.expiring_lots')
                .split(' ')
                .slice(0, 3)
                .join(' ')}
            </CardTitle>
            <CardDescription>
              {translate('app.dashboard.expiring_lots')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.expiring_lots.length === 0 ? (
              <div className="flex items-center text-green-600 py-4">
                <CheckCircle className="h-5 w-5 mr-2" />
                {translate('ra.page.empty', { name: '' })}
              </div>
            ) : (
              <div className="space-y-3">
                {kpis.expiring_lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{lot.produit_denomination}</p>
                      <p className="text-sm text-muted-foreground">
                        {translate('resources.lots.fields.numero_lot')}:{' '}
                        {lot.numero_lot} •{' '}
                        {translate('resources.lots.fields.quantite_actuelle')}:{' '}
                        {lot.quantite}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-bold ${lot.jours_restants <= 7 ? 'text-red-600' : 'text-orange-600'}`}
                      >
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
            <CardDescription>
              {translate('app.dashboard.total_products')}
            </CardDescription>
            <CardTitle className="text-2xl">{kpis.total_products}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              {translate('app.dashboard.products_in_stock')}
            </CardDescription>
            <CardTitle className="text-2xl">
              {kpis.products_with_stock}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              {translate('app.dashboard.expiring_90_days')}
            </CardDescription>
            <CardTitle className="text-2xl">
              {kpis.lots_expiring_90_days}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {magazineOrders && magazineOrders.magasins.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Warehouse className="h-6 w-6" />
            Commandes par Magasin
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {magazineOrders.magasins.map((mag) => (
              <Card key={mag.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{mag.nom}</CardTitle>
                  <CardDescription>
                    {mag.type_magasin} • {mag.services_count} services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-2">
                      <div className="text-2xl font-bold text-orange-600">
                        {mag.pending_count}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        En attente
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {mag.in_progress_count}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        En cours
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 rounded-lg p-2">
                      <div className="text-2xl font-bold text-green-600">
                        {mag.delivered_count}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Livrées
                      </div>
                    </div>
                  </div>
                  {mag.pending_orders.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Commandes en attente:</p>
                      {mag.pending_orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="text-sm p-2 bg-muted rounded flex justify-between"
                        >
                          <span>{order.numero_commande}</span>
                          <span className="text-muted-foreground">
                            {order.service_nom}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
