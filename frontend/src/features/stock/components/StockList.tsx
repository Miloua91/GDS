import { useState, useMemo, useCallback } from "react"
import { useTranslate } from "ra-core"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertTriangle, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useStock, type StockItem } from "@/hooks/useStock"

const getStockStatus = (item: StockItem) => {
  if (item.total_stock === 0) return "rupture"
  if (item.total_stock <= item.stock_alerte) return "alert"
  return "ok"
}

const StockStatusBadge = ({ item }: { item: StockItem }) => {
  const status = getStockStatus(item)
  
  if (status === "rupture") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Rupture
      </Badge>
    )
  }
  
  if (status === "alert") {
    return (
      <Badge className="bg-orange-500 gap-1">
        <AlertTriangle className="h-3 w-3" />
        Alerte
      </Badge>
    )
  }
  
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800 gap-1">
      <CheckCircle className="h-3 w-3" />
      OK
    </Badge>
  )
}

const ITEMS_PER_PAGE = 20

export const StockList = () => {
  const translate = useTranslate()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  
  const { stock, total, isLoading, refetch } = useStock(page, search)
  
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{translate("ra.page.stock", { _: "Stock" })}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">En alerte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stock.filter(s => getStockStatus(s) === "alert").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Rupture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stock.filter(s => getStockStatus(s) === "rupture").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stock.filter(s => getStockStatus(s) === "ok").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Forme</TableHead>
              <TableHead>DCI</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Alerte</TableHead>
              <TableHead className="text-right">Sécurité</TableHead>
              <TableHead className="text-center">Lots</TableHead>
              <TableHead className="text-center">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : stock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Aucun produit trouvé
                </TableCell>
              </TableRow>
            ) : (
              stock.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {item.code_national}
                    {item.code_interne && (
                      <div className="text-muted-foreground">{item.code_interne}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.denomination}</div>
                    <div className="text-xs text-muted-foreground">{item.dosage}</div>
                  </TableCell>
                  <TableCell>{item.forme_pharmaceutique}</TableCell>
                  <TableCell>{item.dci}</TableCell>
                  <TableCell className="text-right font-bold">{item.total_stock}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.stock_alerte}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.stock_securite}</TableCell>
                  <TableCell className="text-center">{item.lots_count}</TableCell>
                  <TableCell className="text-center">
                    <StockStatusBadge item={item} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Affichage de {(page - 1) * ITEMS_PER_PAGE + 1} à {Math.min(page * ITEMS_PER_PAGE, total)} sur {total} résultats
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} sur {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
