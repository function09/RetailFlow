import { getCustomerAddresses, getCustomers } from "@/api/customers"
import { createOrder } from "@/api/orders"
import { getProducts } from "@/api/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Customer, OrderAddressInput, Products } from "@/types/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

const emptyAddressForm: OrderAddressInput = {
  street_line_1: "",
  street_line_2: "",
  city: "",
  state: "",
  zip_code: "",
}

export default function CreateOrder() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState<string>("")
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState<string>("")

  const [fulfillment, setFulfillment] = useState<string>("")
  const [items, setItems] = useState<{ product: Products; quantity: number }[]>([])

  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null)
  const [productSearch, setProductSearch] = useState<string>("")
  const [debouncedProductSearch, setDebouncedProductSearch] = useState<string>("")
  const [selectedQuantity, setSelectedQuantity] = useState<number>(0)

  const [selectedAddressID, setSelectedAddressID] = useState<number | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false)
  const [newAddressForm, setNewAddressForm] = useState<OrderAddressInput>(emptyAddressForm)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 300)
    return () => clearTimeout(timer)
  }, [customerSearch])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedProductSearch(productSearch), 300)
    return () => clearTimeout(timer)
  }, [productSearch])

  const { data: customerResults } = useQuery({
    queryKey: ["customers", debouncedCustomerSearch],
    queryFn: () => getCustomers(5, 0, debouncedCustomerSearch),
    enabled: debouncedCustomerSearch.length > 0,
  })

  const { data: productResults } = useQuery({
    queryKey: ["products", debouncedProductSearch],
    queryFn: () => getProducts(5, 0, debouncedProductSearch),
    enabled: debouncedProductSearch.length > 0,
  })

  const { data: customerAddresses } = useQuery({
    queryKey: ["addresses", customer?.ID],
    queryFn: () => getCustomerAddresses(String(customer!.ID)),
    enabled: !!customer,
  })

  useEffect(() => {
    if (!customerAddresses) return
    const defaultAddr = customerAddresses.find((a) => a.IsDefault)
    setSelectedAddressID(defaultAddr?.ID ?? null)
    setShowNewAddressForm(customerAddresses.length === 0)
    setNewAddressForm(emptyAddressForm)
  }, [customerAddresses])

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      navigate(`/orders/${data.ID}`)
    },
    onError: (error) => toast.error(error.message),
  })

  const buildAddress = (): OrderAddressInput | null => {
    if (fulfillment === "pickup") return null
    if (showNewAddressForm) return newAddressForm
    const found = customerAddresses?.find((a) => a.ID === selectedAddressID)
    if (!found) return null
    return {
      street_line_1: found.StreetLine1,
      street_line_2: found.StreetLine2,
      city: found.City,
      state: found.State,
      zip_code: found.ZipCode,
    }
  }

  const handleSubmit = () => {
    if (!customer || items.length === 0 || !fulfillment) return
    const address = buildAddress()
    if (fulfillment === "shipping" && !address) {
      toast.error("Please select or enter a shipping address")
      return
    }
    mutation.mutate({
      customer_id: customer.ID,
      fulfillment,
      order_items: items.map((i) => ({ product_id: i.product.ID, quantity: i.quantity })),
      address,
    })
  }

  const handleAddItem = () => {
    if (!selectedProduct) return
    const existing = items.find((i) => i.product.ID === selectedProduct.ID)
    if (existing) {
      setItems(items.map((i) => i.product.ID === selectedProduct.ID ? { ...i, quantity: i.quantity + selectedQuantity } : i))
    } else {
      setItems([...items, { product: selectedProduct, quantity: selectedQuantity }])
    }
    setSelectedProduct(null)
    setProductSearch("")
    setSelectedQuantity(1)
  }

  const handleRemoveItem = (productID: number) => {
    setItems(items.filter((i) => i.product.ID !== productID))
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">Create Order</h1>
      <div className="space-y-6 max-w-2xl mx-auto">

        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent>
            <Combobox
              value={customer ? String(customer.ID) : ""}
              onValueChange={(val) => {
                const found = customerResults?.find((c) => String(c.ID) === val) ?? null
                setCustomer(found)
                setCustomerSearch("")
                setSelectedAddressID(null)
                setShowNewAddressForm(false)
                setNewAddressForm(emptyAddressForm)
              }}
            >
              <ComboboxInput
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder={customer ? `${customer.FirstName} ${customer.LastName}` : "Search customers..."}
                showClear={!!customer}
              />
              {!customer && !customerSearch && (
                <p className="text-xs text-muted-foreground mt-1">Type to search customers</p>
              )}
              {debouncedCustomerSearch && (
                <ComboboxContent>
                  <ComboboxList>
                    {customerResults?.length === 0
                      ? <ComboboxEmpty>No customers found.</ComboboxEmpty>
                      : (customerResults ?? []).map((c) => (
                        <ComboboxItem key={c.ID} value={String(c.ID)}>
                          {c.FirstName} {c.LastName} — {c.Email}
                        </ComboboxItem>
                      ))}
                  </ComboboxList>
                </ComboboxContent>
              )}
            </Combobox>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fulfillment</CardTitle></CardHeader>
          <CardContent>
            <Select value={fulfillment} onValueChange={setFulfillment}>
              <SelectTrigger><SelectValue placeholder="Select fulfillment type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {customer && fulfillment === "shipping" && (
          <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(customerAddresses ?? []).length > 0 && (
                <div className="space-y-2">
                  {customerAddresses?.map((a) => (
                    <div
                      key={a.ID}
                      onClick={() => { setSelectedAddressID(a.ID); setShowNewAddressForm(false) }}
                      className={`cursor-pointer rounded-md border p-3 text-sm transition-colors ${selectedAddressID === a.ID && !showNewAddressForm ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-medium">{a.AddressType}</span>
                        {a.IsDefault && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>}
                      </div>
                      <p className="text-muted-foreground">{a.StreetLine1}{a.StreetLine2 ? `, ${a.StreetLine2}` : ""}</p>
                      <p className="text-muted-foreground">{a.City}, {a.State} {a.ZipCode}</p>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowNewAddressForm(true); setSelectedAddressID(null) }}
                  >
                    Enter a different address
                  </Button>
                </div>
              )}

              {showNewAddressForm && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Street Line 1 *</Label>
                    <Input value={newAddressForm.street_line_1} onChange={(e) => setNewAddressForm({ ...newAddressForm, street_line_1: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Street Line 2</Label>
                    <Input value={newAddressForm.street_line_2} onChange={(e) => setNewAddressForm({ ...newAddressForm, street_line_2: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>City *</Label>
                    <Input value={newAddressForm.city} onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>State *</Label>
                      <Input value={newAddressForm.state} onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Zip Code *</Label>
                      <Input value={newAddressForm.zip_code} onChange={(e) => setNewAddressForm({ ...newAddressForm, zip_code: e.target.value })} />
                    </div>
                  </div>
                  {(customerAddresses ?? []).length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => { setShowNewAddressForm(false); setSelectedAddressID(customerAddresses?.find(a => a.IsDefault)?.ID ?? customerAddresses?.[0]?.ID ?? null) }}>
                      ← Back to saved addresses
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <Label>Product</Label>
                <Combobox
                  value={selectedProduct ? String(selectedProduct.ID) : ""}
                  onValueChange={(val) => {
                    const found = productResults?.find((c) => String(c.ID) === val) ?? null
                    setSelectedProduct(found)
                    setProductSearch("")
                  }}
                >
                  <ComboboxInput
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={selectedProduct ? `${selectedProduct.Name}` : "Search products..."}
                    showClear={!!selectedProduct}
                  />
                  {!selectedProduct && !productSearch && (
                    <p className="text-xs text-muted-foreground mt-1">Type to search products</p>
                  )}
                  {debouncedProductSearch && (
                    <ComboboxContent>
                      <ComboboxList>
                        {productResults?.length === 0
                          ? <ComboboxEmpty>No products found.</ComboboxEmpty>
                          : (productResults ?? []).map((c) => (
                            <ComboboxItem key={c.ID} value={String(c.ID)}>
                              {c.Name} — ${(c.Price / 100).toFixed(2)}
                            </ComboboxItem>
                          ))}
                      </ComboboxList>
                    </ComboboxContent>
                  )}
                </Combobox>
              </div>
              <div className="w-24 space-y-1">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={selectedQuantity === 0 ? "" : selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleAddItem} disabled={!selectedProduct}>Add</Button>
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
                  {items.map((i) => (
                    <TableRow key={i.product.ID}>
                      <TableCell>{i.product.Name}</TableCell>
                      <TableCell>${(i.product.Price / 100).toFixed(2)}</TableCell>
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
    </>
  )
}
