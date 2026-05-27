import { createProduct, updateProduct } from "@/api/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProductFormProps, Products } from "@/types/types"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

function ProductForm({ categories, product, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<Products>(
    product ? { ...product, Price: product.Price / 100 } : { ID: 0, SKU: "", Name: "", Price: 0, Quantity: 0, Category: "", CategoryID: 0 }
  )

  const isEditing = product?.ID !== 0

  const payload = {
    name: formData.Name,
    sku: formData.SKU,
    price: formData.Price * 100,
    quantity: formData.Quantity,
    category_id: formData.CategoryID,
  }

  const mutation = useMutation({
    mutationFn: () => isEditing ? updateProduct(formData.ID, payload) : createProduct(payload),
    onSuccess: () => {
      toast.success(isEditing ? "Product updated" : "Product created")
      onSuccess()
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "An unexpected error occurred"),
  })

  return (
    <div className="flex flex-col gap-5 mt-4 px-1">
      <div className="space-y-1.5">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" className="max-w-xs" value={formData.SKU} onChange={e => setFormData({ ...formData, SKU: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" className="max-w-xs" value={formData.Name} onChange={e => setFormData({ ...formData, Name: e.target.value })} />
      </div>
      <div className="flex gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price ($)</Label>
          <Input id="price" type="number" step="0.01" className="w-28" value={formData.Price === 0 ? "" : formData.Price} onChange={e => setFormData({ ...formData, Price: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" className="w-24" value={formData.Quantity === 0 ? "" : formData.Quantity} onChange={e => setFormData({ ...formData, Quantity: Number(e.target.value) })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={formData.CategoryID === 0 ? "" : String(formData.CategoryID)} onValueChange={value => setFormData({ ...formData, CategoryID: Number(value) })}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories.map(cat =>
                <SelectItem key={cat.ID} value={String(cat.ID)}>{cat.Category}</SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="pt-2">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

export default ProductForm
