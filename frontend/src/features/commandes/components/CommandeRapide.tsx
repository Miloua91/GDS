import { useState, useEffect, useCallback } from 'react'
import { useTranslate } from 'ra-core'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  ShoppingCart,
  Plus,
  X,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { API_URL } from '@/lib/config'

interface Produit {
  id: number
  code_national: string
  code_interne: string
  denomination: string
  dci: string
  forme_pharmaceutique: string
  dosage: string
  stock_total: number
}

interface Service {
  id: number
  nom: string
}

interface OrderLine {
  produit_id: number
  denomination: string
  quantite_demandee: number
}

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token')
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) throw new Error('Échec de la récupération des données')
  return response.json()
}

export const CommandeRapide = () => {
  const translate = useTranslate()
  const [search, setSearch] = useState('')
  const [produits, setProduits] = useState<Produit[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [cart, setCart] = useState<OrderLine[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [userFonction, setUserFonction] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setUserFonction(userData.fonction)
      if (userData.service_id) {
        setSelectedService(userData.service_id)
      }
    }
  }, [])

  useEffect(() => {
    fetchWithAuth(`${API_URL}services/`)
      .then((data) => setServices(data.results || []))
      .catch(console.error)
  }, [])

  const searchProduits = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const url = query
        ? `${API_URL}produits-with-stock/?search=${encodeURIComponent(query)}`
        : `${API_URL}produits-with-stock/`
      const data = await fetchWithAuth(url)
      setProduits(data.results || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchProduits(search)
    }, 300)
    return () => clearTimeout(debounce)
  }, [search, searchProduits])

  const addToCart = (produit: Produit) => {
    const existing = cart.find((item) => item.produit_id === produit.id)
    if (existing) {
      setCart(
        cart.map((item) =>
          item.produit_id === produit.id
            ? { ...item, quantite_demandee: item.quantite_demandee + 1 }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          produit_id: produit.id,
          denomination: produit.denomination,
          quantite_demandee: 1,
        },
      ])
    }
  }

  const removeFromCart = (produit_id: number) => {
    setCart(cart.filter((item) => item.produit_id !== produit_id))
  }

  const handleSubmit = async () => {
    if (!selectedService || cart.length === 0) return

    setSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API_URL}commandes-rapides/`, {
        method: 'POST',
        body: JSON.stringify({
          service_id: selectedService,
          lignes: cart.map((item) => ({
            produit_id: item.produit_id,
            quantite_demandee: item.quantite_demandee,
          })),
        }),
      })
      setOrderNumber(data.numero_commande)
      setSuccess(true)
      setCart([])
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0)
      return (
        <Badge variant="destructive">
          {translate('app.quick_order.stock_rupture')}
        </Badge>
      )
    if (stock < 10)
      return (
        <Badge variant="secondary">
          {translate('app.stock.current_stock')}: {stock}
        </Badge>
      )
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        {translate('app.stock.current_stock')}: {stock}
      </Badge>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {translate('app.quick_order.order_created')}
            </h2>
            <p className="text-muted-foreground mb-4">
              {translate('resources.commandes.name')}{' '}
              <strong>{orderNumber}</strong> {translate('ra.action.save')}
            </p>
            <Button onClick={() => setSuccess(false)}>
              {translate('app.quick_order.title')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{translate('app.quick_order.title')}</CardTitle>
              <CardDescription>
                {translate('app.quick_order.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={translate('ra.action.search_placeholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : produits.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {search
                      ? translate('ra.message.no_match')
                      : translate('ra.action.search')}
                  </div>
                ) : (
                  produits.map((produit) => (
                    <Card key={produit.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {produit.denomination}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {produit.dci}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {produit.forme_pharmaceutique} • {produit.dosage}
                          </p>
                        </div>
                        {getStockBadge(produit.stock_total)}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => addToCart(produit)}
                        disabled={produit.stock_total === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" />{' '}
                        {translate('ra.action.add')}
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-6 space-y-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {translate('app.quick_order.articles')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userFonction === 'PHARMACIEN' ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {translate('app.quick_order.service')}
                  </label>
                  <select
                    value={selectedService || ''}
                    onChange={(e) => setSelectedService(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">
                      {translate('app.quick_order.select_service')}
                    </option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.nom}
                      </option>
                    ))}
                  </select>
                </div>
              ) : selectedService ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {translate('resources.services.name')}
                  </label>
                  <div className="w-full h-9 rounded-md border border-input bg-muted px-3 py-1.5 text-sm">
                    {services.find((s) => s.id === selectedService)?.nom}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {translate('app.quick_order.service')}
                  </label>
                  <select
                    value={selectedService || ''}
                    onChange={(e) => setSelectedService(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">
                      {translate('app.quick_order.select_service')}
                    </option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-2 block">
                  {translate('app.quick_order.articles')} ({cart.length})
                </label>
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {translate('app.quick_order.no_articles')}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.produit_id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="truncate">{item.denomination}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantite_demandee}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1
                              setCart(
                                cart.map((c) =>
                                  c.produit_id === item.produit_id
                                    ? { ...c, quantite_demandee: newQty > 0 ? newQty : 1 }
                                    : c
                                ).filter((c) => c.quantite_demandee > 0)
                              )
                            }}
                            className="h-7 w-16 text-center"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeFromCart(item.produit_id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!selectedService || cart.length === 0 || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {translate('ra.page.loading')}
                  </>
                ) : (
                  translate('ra.action.submit')
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
