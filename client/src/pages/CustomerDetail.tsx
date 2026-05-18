import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Customer } from "@/types/types"
import { useEffect, useState } from "react"
import { useParams } from "react-router"


export default function CustomerDetail() {
  const { customerID } = useParams()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {

    const fetchCustomer = async () => {
      setLoading(true)
      try {
        const options = { credentials: "include" as const, headers: { "Content-Type": "application/json" } }
        const url = "http://localhost:8080"

        const customersRes = await fetch(url + `/customers/${customerID}`, options)

        if (!customersRes.ok) {
          throw new Error("Failed to fetch customers")
        }

        const customersJSON = await customersRes.json()
        setCustomer(customersJSON)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomer()
  }, [customerID])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {loading ? "Loading..." : customer ? `${customer.FirstName} ${customer.LastName}` : "Customer not found"}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{customer?.Email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Orders</h2>
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          Orders coming soon.
        </div>
      </div>
    </div>
  )
}
