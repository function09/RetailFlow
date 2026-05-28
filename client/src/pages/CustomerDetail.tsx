import { addCustomerAddress, deleteAddress, getCustomer, getCustomerAddresses, getCustomerOrders, setDefaultAddress } from "@/api/customers"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AddressInput } from "@/types/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Star, Trash2 } from "lucide-react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"

const emptyAddress: AddressInput = {
  StreetLine1: "",
  StreetLine2: "",
  City: "",
  State: "",
  ZipCode: "",
  AddressType: "shipping",
  IsDefault: false,
}

export default function CustomerDetail() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { customerID } = useParams()

  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [form, setForm] = useState<AddressInput>(emptyAddress)

  const { data: customer, isLoading: customerLoading, isError: customerError } = useQuery({
    queryKey: ["customer", customerID],
    queryFn: () => getCustomer(customerID!),
    enabled: !!customerID,
  })

  const { data: orders, isLoading: ordersLoading, isError: ordersError } = useQuery({
    queryKey: ["orders", customerID],
    queryFn: () => getCustomerOrders(customerID!),
    enabled: !!customerID,
  })

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses", customerID],
    queryFn: () => getCustomerAddresses(customerID!),
    enabled: !!customerID,
  })

  const addMutation = useMutation({
    mutationFn: (data: AddressInput) => addCustomerAddress(customerID!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", customerID] })
      setForm(emptyAddress)
      setAddSheetOpen(false)
      toast.success("Address added")
    },
    onError: (e) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", customerID] })
      toast.success("Address removed")
    },
    onError: (e) => toast.error(e.message),
  })

  const setDefaultMutation = useMutation({
    mutationFn: (addressID: number) => setDefaultAddress(customerID!, addressID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", customerID] })
      toast.success("Default address updated")
    },
    onError: (e) => toast.error(e.message),
  })

  const handleAdd = () => {
    if (!form.StreetLine1 || !form.City || !form.State || !form.ZipCode) {
      toast.error("Please fill in all required fields")
      return
    }
    addMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate("/customers")}>
        <ChevronLeft className="h-4 w-4" />Back
      </Button>

      {customerLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : customerError ? (
        <p className="text-muted-foreground">Failed to load customer.</p>
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">{customer?.FirstName} {customer?.LastName}</h1>
          <Card className="max-w-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{customer?.Email}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Addresses</CardTitle>
          <Button size="sm" onClick={() => setAddSheetOpen(true)}>Add Address</Button>
        </CardHeader>
        <CardContent>
          {addressesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : addresses?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addresses on file.</p>
          ) : (
            <div className="space-y-3">
              {addresses?.map((address) => (
                <div key={address.ID} className="flex items-start justify-between rounded-md border p-3 text-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium">{address.AddressType}</span>
                      {address.IsDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{address.StreetLine1}</p>
                    {address.StreetLine2 && <p className="text-muted-foreground">{address.StreetLine2}</p>}
                    <p className="text-muted-foreground">{address.City}, {address.State} {address.ZipCode}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!address.IsDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Set as default"
                        onClick={() => setDefaultMutation.mutate(address.ID)}
                        disabled={setDefaultMutation.isPending}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(address.ID)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={addSheetOpen} onOpenChange={(open) => { if (!open) { setForm(emptyAddress) } setAddSheetOpen(open) }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Address</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4 px-4">
            <div className="space-y-1">
              <Label>Street Line 1 *</Label>
              <Input value={form.StreetLine1} onChange={(e) => setForm({ ...form, StreetLine1: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Street Line 2</Label>
              <Input value={form.StreetLine2} onChange={(e) => setForm({ ...form, StreetLine2: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>City *</Label>
              <Input value={form.City} onChange={(e) => setForm({ ...form, City: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>State *</Label>
                <Input value={form.State} onChange={(e) => setForm({ ...form, State: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Zip Code *</Label>
                <Input value={form.ZipCode} onChange={(e) => setForm({ ...form, ZipCode: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Address Type *</Label>
              <Select value={form.AddressType} onValueChange={(val) => setForm({ ...form, AddressType: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-default"
                checked={form.IsDefault}
                onChange={(e) => setForm({ ...form, IsDefault: e.target.checked })}
              />
              <Label htmlFor="is-default">Set as default</Label>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={addMutation.isPending}>
              {addMutation.isPending ? "Saving..." : "Add Address"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Orders</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : ordersError ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Failed to load orders.
                  </TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.ID} onClick={() => navigate("/orders/" + order.ID)} className="cursor-pointer">
                    <TableCell className="font-medium">#{order.ID}</TableCell>
                    <TableCell><StatusBadge status={order.Status} /></TableCell>
                    <TableCell className="capitalize">{order.Fulfillment}</TableCell>
                    <TableCell>{new Date(order.CreatedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
