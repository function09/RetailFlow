import { getMetrics } from "@/api/metrics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AuthContext } from "@/context/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { useContext } from "react"

export function DashBoard() {
  const { user } = useContext(AuthContext)

  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    refetchInterval: 60000,
  })

  const totalOrders = metrics
    ? Object.values(metrics.OrdersByStatus).reduce((sum, count) => sum + count, 0)
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome back, {user?.sub}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${((metrics?.TotalRevenue ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(metrics?.OrdersByStatus["pending"] ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(metrics?.OrdersByStatus["confirmed"] ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(metrics?.OrdersByStatus ?? {}).map(([status, count]) => (
                  <TableRow key={status}>
                    <TableCell className="capitalize">{status}</TableCell>
                    <TableCell className="text-right">{count.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(metrics?.TopProducts ?? []).map((p) => (
                  <TableRow key={p.Name}>
                    <TableCell>{p.Name}</TableCell>
                    <TableCell className="text-right">{p.TotalSold.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
