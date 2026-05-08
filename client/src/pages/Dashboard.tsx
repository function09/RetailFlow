import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthContext } from "@/context/AuthContext"
import type { Counts } from "@/types/types"
import { useContext, useEffect, useState } from "react"

export function DashBoard() {
  const { user } = useContext(AuthContext)
  const [counts, setCounts] = useState<Counts>({ orders: 0, customers: 0, products: 0 })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const options = { credentials: "include" as const, headers: { "Content-Type": "application/json" } }
        const url = "http://localhost:8080"

        const [orderRes, customerRes, productsRes] = await Promise.all([
          fetch(url + "/orders", options),
          fetch(url + "/customers", options),
          fetch(url + "/products", options),
        ])

        if (!orderRes.ok || !customerRes.ok || !productsRes.ok) {
          throw new Error("Failed to fetch counts")
        }

        const [orders, customers, products] = await Promise.all([
          orderRes.json(),
          customerRes.json(),
          productsRes.json(),
        ])

        setCounts({ orders: orders.length, customers: customers.length, products: products.length })
      } catch (e) {
        console.log(e)
      }
    }
    fetchCounts()
  }, [])

  return (
    <div>

      <div>Welcome {user?.sub}</div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div>{counts.orders}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div>{counts.customers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div>{counts.products}</div>
        </CardContent>
      </Card>
    </div>)
}
