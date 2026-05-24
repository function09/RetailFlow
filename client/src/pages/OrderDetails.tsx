import { getOrderDetails, updateOrderStatus } from "@/api/orders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function OrderDetails() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { orderID } = useParams()
  const { data: orderDetails, isLoading, isError } = useQuery({ queryKey: ["orderDetails", orderID], queryFn: () => getOrderDetails(orderID!), enabled: !!orderID })

  const mutation = useMutation({
    mutationFn: (newStatus: string) => updateOrderStatus(Number(orderID), newStatus), onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails", orderID] })
    },
    onError: (error) => toast.error(error.message)
  })

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-4 w-4" />Back
      </Button>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : isError ? (
        <p className="text-muted-foreground">Failed to load order.</p>
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Order #{orderDetails?.Order.ID}</h1>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p>{orderDetails?.Order.FirstName} {orderDetails?.Order.LastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Select
                    value={orderDetails?.Order.Status}
                    onValueChange={(val) => mutation.mutate(val)}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fulfillment</p>
                  <p className="capitalize">{orderDetails?.Order.Fulfillment}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{orderDetails && new Date(orderDetails.Order.CreatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p>{orderDetails?.Order.StreetLine1}</p>
                {orderDetails?.Order.StreetLine2 && <p>{orderDetails.Order.StreetLine2}</p>}
                <p>{orderDetails?.Order.City}, {orderDetails?.Order.State} {orderDetails?.Order.ZipCode}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails?.OrderItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        No items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderDetails?.OrderItems.map((item) => (
                      <TableRow key={item.ID}>
                        <TableCell className="font-medium">{item.Name}</TableCell>
                        <TableCell>{item.Quantity}</TableCell>
                        <TableCell>${(item.Price / 100).toFixed(2)}</TableCell>
                        <TableCell>${((item.Price * item.Quantity) / 100).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
