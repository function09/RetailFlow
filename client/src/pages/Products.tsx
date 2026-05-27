import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Products } from "@/types/types"
import { useEffect, useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react"
import ProductForm from "@/components/ProductForm"
import { toast } from "sonner"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteProduct, getCategories, getProducts } from "@/api/products"

export default function Products() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [sort, setSort] = useState<string>("")
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null)

  const { data: ProductsData, isLoading: productsIsLoading, isPlaceholderData: productsIsPlaceholderData } = useQuery({ queryKey: ["products", page, debouncedSearch, sort, order], queryFn: () => getProducts(20, (page - 1) * 20, debouncedSearch, sort, order), placeholderData: keepPreviousData })
  const { data: CategoriesData } = useQuery({ queryKey: ["categories"], queryFn: () => getCategories() })

  const mutation = useMutation({
    mutationFn: deleteProduct, onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product successfully removed")
    },
    onError: (error) => toast.error(error.message)
  })

  const handleSort = (column: string) => {
    if (sort === column) {
      setOrder(o => o === "asc" ? "desc" : "asc")
    } else {
      setSort(column)
      setOrder("asc")
    }
    setPage(1)
  }

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
        <Button onClick={() => setSelectedProduct({ ID: 0, SKU: "", Name: "", Price: 0, Quantity: 0, Category: "", CategoryID: 0 })}>Add Product</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("sku")}
              >
                <span className="flex items-center gap-1">
                  SKU {sort === "sku" ? (order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("name")}
              >
                <span className="flex items-center gap-1">
                  Name {sort === "name" ? (order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("price")}
              >
                <span className="flex items-center gap-1">
                  Price {sort === "price" ? (order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("quantity")}
              >
                <span className="flex items-center gap-1">
                  Quantity {sort === "quantity" ? (order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("category")}
              >
                <span className="flex items-center gap-1">
                  Category {sort === "category" ? (order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}

                </span>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsIsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : ProductsData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              (ProductsData ?? []).map((product) => (
                <TableRow key={product.ID}>
                  <TableCell className="font-mono text-xs">{product.SKU}</TableCell>
                  <TableCell className="font-medium">{product.Name}</TableCell>
                  <TableCell>${(product.Price / 100).toFixed(2)}</TableCell>
                  <TableCell>{product.Quantity}</TableCell>
                  <TableCell>{product.Category}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setSelectedProduct(product)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => mutation.mutate(product.ID)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={selectedProduct !== null} onOpenChange={(open) => { if (!open) setSelectedProduct(null) }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedProduct?.ID === 0 ? "Add Product" : "Edit Product"}</SheetTitle>
          </SheetHeader>
          <ProductForm product={selectedProduct} categories={CategoriesData ?? []} onSuccess={() => {
            setSelectedProduct(null)
            queryClient.invalidateQueries({ queryKey: ["products"] })
          }} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || productsIsLoading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!productsIsPlaceholderData) {
              setPage(p => p + 1)
            }
          }
          }
          disabled={(ProductsData ?? []).length < 20 || productsIsLoading}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
