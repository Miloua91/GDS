import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus, Minus, X, Loader2, CheckCircle, Upload, FileText } from "lucide-react"

interface Produit {
  id: number
  code_national: string
  code_interne: string
  denomination: string
  dci: string
  forme_pharmaceutique: string
  dosage: string
}

interface Fournisseur {
  id: number
  raison_sociale: string
  code_fournisseur: string
}

interface LotLine {
  produit_id: number
  denomination: string
  numero_lot: string
  quantite: number
  date_peremption: string
  date_fabrication: string
  prix_unitaire: number | string
}

const API_URL = 'http://localhost:8000/api/'

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

export const StockReception = () => {
  const [search, setSearch] = useState("")
  const [produits, setProduits] = useState<Produit[]>([])
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [selectedFournisseur, setSelectedFournisseur] = useState<number | null>(null)
  const [lots, setLots] = useState<LotLine[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [receptionResult, setReceptionResult] = useState<any>(null)

  useEffect(() => {
    fetchWithAuth(`${API_URL}fournisseurs/`)
      .then(data => setFournisseurs(data.results || []))
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

  const addLot = (produit: Produit) => {
    const today = new Date().toISOString().split('T')[0]
    const expDate = new Date()
    expDate.setFullYear(expDate.getFullYear() + 1)
    
    const newLot: LotLine = {
      produit_id: produit.id,
      denomination: produit.denomination,
      numero_lot: `LOT-${Date.now()}`,
      quantite: 1,
      date_peremption: expDate.toISOString().split('T')[0],
      date_fabrication: today,
      prix_unitaire: ''
    }
    setLots([...lots, newLot])
  }

  const updateLot = (index: number, field: keyof LotLine, value: any) => {
    setLots(lots.map((lot, i) => {
      if (i === index) {
        return { ...lot, [field]: value }
      }
      return lot
    }))
  }

  const removeLot = (index: number) => {
    setLots(lots.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!selectedFournisseur || lots.length === 0) return
    
    setSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API_URL}stock/reception/`, {
        method: 'POST',
        body: JSON.stringify({
          fournisseur_id: selectedFournisseur,
          lignes: lots.map(item => ({
            produit_id: item.produit_id,
            numero_lot: item.numero_lot,
            quantite: item.quantite,
            date_fabrication: item.date_fabrication,
            date_peremption: item.date_peremption,
            prix_unitaire: item.prix_unitaire || null
          }))
        })
      })
      setReceptionResult(data)
      setSuccess(true)
      setLots([])
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (success && receptionResult) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Stock reçu!</h2>
            <p className="text-muted-foreground mb-4">
              <strong>{receptionResult.nombre_lots}</strong> lot(s) ont été ajoutés pour le fournisseur <strong>{receptionResult.fournisseur_nom}</strong>
            </p>
            <div className="text-left bg-muted p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Lots créés:</h3>
              {receptionResult.lots.map((lot: any, idx: number) => (
                <p key={idx} className="text-sm">
                  • {lot.produit_denomination} - {lot.numero_lot} (x{lot.quantite})
                </p>
              ))}
            </div>
            <Button onClick={() => {
              setSuccess(false)
              setReceptionResult(null)
              setSelectedFournisseur(null)
            }}>
              Nouvelle réception
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
              <CardTitle>Réception de Stock</CardTitle>
              <CardDescription>Ajoutez des lots de produits reçus du fournisseur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
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
                    {search ? "Aucun produit trouvé" : "Recherchez un produit pour commencer"}
                  </div>
                ) : (
                  produits.map(produit => (
                    <Card key={produit.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{produit.denomination}</p>
                          <p className="text-sm text-muted-foreground">{produit.dci}</p>
                          <p className="text-xs text-muted-foreground">
                            {produit.forme_pharmaceutique} • {produit.dosage}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => addLot(produit)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter Lot
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Détails de réception
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Fournisseur</label>
                <select
                  value={selectedFournisseur || ""}
                  onChange={(e) => setSelectedFournisseur(Number(e.target.value))}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.raison_sociale}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-2 block">Lots à recevoir ({lots.length})</label>
                {lots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun lot ajouté</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {lots.map((lot, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm truncate">{lot.denomination}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeLot(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">N° Lot</label>
                            <Input
                              value={lot.numero_lot}
                              onChange={(e) => updateLot(index, 'numero_lot', e.target.value)}
                              className="h-7 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Quantité</label>
                            <Input
                              type="number"
                              min="1"
                              value={lot.quantite}
                              onChange={(e) => updateLot(index, 'quantite', parseInt(e.target.value) || 1)}
                              className="h-7 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">Date fabrication</label>
                            <Input
                              type="date"
                              value={lot.date_fabrication}
                              onChange={(e) => updateLot(index, 'date_fabrication', e.target.value)}
                              className="h-7 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Date expiration</label>
                            <Input
                              type="date"
                              value={lot.date_peremption}
                              onChange={(e) => updateLot(index, 'date_peremption', e.target.value)}
                              className="h-7 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Prix unitaire (DZD)</label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Optionnel"
                            value={lot.prix_unitaire}
                            onChange={(e) => updateLot(index, 'prix_unitaire', e.target.value)}
                            className="h-7 text-sm"
                          />
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
                disabled={!selectedFournisseur || lots.length === 0 || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Confirmer la réception"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
