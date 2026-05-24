import { getCustomers } from "@/api/customers"
import { createOrder } from "@/api/orders"
import { getProducts } from "@/api/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Customer, Products } from "@/types/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

export default function CreateOrder() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [fulfillment, setFulFillment] = useState<string>("")
  const [items, setItems] = useState<{ product: Products, quantity: number }[]>([])
  const [selectedProductID, setSelectedProductID] = useState<string>("")
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)

  const { data: customerData, isLoading: customerIsLoading } = useQuery({ queryKey: ["customers"], queryFn: getCustomers })
  const { data: itemData, isLoading: itemIsLoading } = useQuery({ queryKey: ["products"], queryFn: getProducts })

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      navigate(`/orders/${data.ID}`)
    },
    onError: (error) => toast.error(error.message)
  })

  const handleSubmit = () => {
    if (!customer || items.length === 0) {
      console.log("No customer or items have been added to this order")
      return
    }

    mutation.mutate({
      customer_id: customer.ID,
      fulfillment,
      order_items: items.map(i => ({ product_id: i.product.ID, quantity: i.quantity }))
    })
  }

  const handleAddItem = () => {
    const product = itemData?.find(p => p.ID === Number(selectedProductID))
    if (!product) return
    const existing = items.find(i => i.product.ID === product.ID)
    if (existing) {
      setItems(items.map(i => i.product.ID === product.ID ? { ...i, quantity: i.quantity + selectedQuantity } : i))
    } else {
      setItems([...items, { product, quantity: selectedQuantity }])
    }
    setSelectedProductID("")
    setSelectedQuantity(1)
  }

  const handleRemoveItem = (productID: number) => {
    setItems(items.filter(i => i.product.ID !== productID))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Create Order</h1>

      <Card>
        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
        <CardContent>
          <Select
            disabled={customerIsLoading}
            value={customer ? String(customer.ID) : ""}
            onValueChange={(val) => {
              const found = customerData?.find(c => c.ID === Number(val))
              setCustomer(found ?? null)
            }}
          >
            <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
            <SelectContent>
              {customerData?.map(c => (
                <SelectItem key={c.ID} value={String(c.ID)}>
                  {c.FirstName} {c.LastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Fulfillment</CardTitle></CardHeader>
        <CardContent>
          <Select value={fulfillment} onValueChange={setFulFillment}>
            <SelectTrigger><SelectValue placeholder="Select fulfillment type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">Pickup</SelectItem>
              <SelectItem value="shipping">Shipping</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label>Product</Label>
              <Select
                disabled={itemIsLoading}
                value={selectedProductID}
                onValueChange={setSelectedProductID}
              >
                <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                <SelectContent>
                  {itemData?.map(p => (
                    <SelectItem key={p.ID} value={String(p.ID)}>
                      {p.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24 space-y-1">
              <Label>Qty</Label>
              <Input
                type="number"
                min={1}
                value={selectedQuantity}
                onChange={e => setSelectedQuantity(Number(e.target.value))}
              />
            </div>
            <Button onClick={handleAddItem} disabled={!selectedProductID}>Add</Button>
          </div>

          {items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(i => (
                  <TableRow key={i.product.ID}>
                    <TableCell>{i.product.Name}</TableCell>
                    <TableCell>${i.product.Price.toFixed(2)}</TableCell>
                    <TableCell>{i.quantity}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(i.product.ID)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/orders")}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!customer || !fulfillment || items.length === 0 || mutation.isPending}
        >
          {mutation.isPending ? "Creating..." : "Create Order"}
        </Button>
      </div>
    </div>
  )
}
