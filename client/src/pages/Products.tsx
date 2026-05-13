import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Products } from "@/types/types"
import { useEffect, useState } from "react"

export default function Products() {
  const [products, setProducts] = useState<Products[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const options = { credentials: "include" as const, headers: { "Content-Type": "application/json" } }
        const url = "http://localhost:8080"

        const productsRes = await fetch(url + `/products?limit=20&offset=${(page - 1) * 20}&search=${debouncedSearch}`, options)

        if (!productsRes.ok) {
          throw new Error("Failed to fetch counts")
        }

        const productsJSON = await productsRes.json()
        setProducts(productsJSON)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [page, debouncedSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.ID}>
                  <TableCell className="font-mono text-xs">{product.SKU}</TableCell>
                  <TableCell className="font-medium">{product.Name}</TableCell>
                  <TableCell>${(product.Price / 100).toFixed(2)}</TableCell>
                  <TableCell>{product.Quantity}</TableCell>
                  <TableCell>{product.Category}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => p + 1)}
          disabled={products.length < 20 || loading}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
