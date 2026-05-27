import { getCustomer, getCustomerOrders } from "@/api/customers"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"

export default function CustomerDetail() {
  const navigate = useNavigate()
  const { customerID } = useParams()
  const { data: customer, isLoading: customerLoading, isError: customerError } = useQuery({ queryKey: ['customer', customerID], queryFn: () => getCustomer(customerID!), enabled: !!customerID })
  const { data: orders, isLoading: ordersLoading, isError: ordersError } = useQuery({ queryKey: ['orders', customerID], queryFn: () => getCustomerOrders(customerID!), enabled: !!customerID })

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate("/customers")}><ChevronLeft className="h-4 w-4" />Back</Button>

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
                  <TableRow key={order.ID} onClick={() => navigate('/orders/' + order.ID)} className="cursor-pointer">
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
