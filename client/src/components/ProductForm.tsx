import { createProduct, updateProduct } from "@/api/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <div className="flex flex-col gap-4 mt-4">
      <div>
        <label>SKU</label>
        <Input value={formData.SKU} onChange={e => {
          setFormData({ ...formData, SKU: e.target.value })
        }} />
      </div>
      <div>
        <label>Name</label>
        <Input value={formData.Name} onChange={e => {
          setFormData({ ...formData, Name: e.target.value })
        }} />
      </div>
      <div>
        <label>Price</label>
        <Input type="number" step="0.01" value={formData.Price === 0 ? "" : formData.Price} onChange={e => {
          setFormData({ ...formData, Price: Number(e.target.value) })
        }} />
      </div>
      <div>
        <label>Quantity</label>
        <Input type="number" value={formData.Quantity === 0 ? "" : formData.Quantity} onChange={e => {
          setFormData({ ...formData, Quantity: Number(e.target.value) })
        }} />
      </div>
      <div>
        <label>Category</label>
        <Select value={formData.CategoryID === 0 ? "" : String(formData.CategoryID)} onValueChange={value => setFormData({ ...formData, CategoryID: Number(value) })}>
          <SelectTrigger>
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
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>Save</Button>
    </div>
  )
}

export default ProductForm
