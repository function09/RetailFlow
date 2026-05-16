import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Customers } from "@/types/types";
import { useEffect, useState } from "react";



export default function Customers() {
  const [customers, setCustomers] = useState<Customers[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {

        const options = { credentials: "include" as const, headers: { "Content-Type": "application/json" } }
        const url = "http://localhost:8080"

        const customersRes = await fetch(url + `/customers?limit=20&offset=0`, options)

        if (!customersRes.ok) {
          throw new Error("Failed to fetch customers")
        }

        const customersJSON = await customersRes.json()
        setCustomers(customersJSON)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead >
                <span className="flex items-center gap-1">
                  CustomerID
                </span>
              </TableHead>
              <TableHead >
                <span className="flex items-center gap-1">
                  First Name
                </span>
              </TableHead>
              <TableHead >
                <span className="flex items-center gap-1">
                  Last Name
                </span>
              </TableHead>
              <TableHead >
                <span className="flex items-center gap-1">
                  Email
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                </TableRow>
              ))
            ) :
              customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) :
                customers.map((customer) =>
                  <TableRow key={customer.ID}>
                    <TableCell className="font-mono text-xs">{customer.ID}</TableCell>
                    <TableCell className="font-medium">{customer.FirstName}</TableCell>
                    <TableCell className="font-medium">{customer.LastName}</TableCell>
                    <TableCell>{customer.Email}</TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table >
      </div>
    </div>
  )
}

