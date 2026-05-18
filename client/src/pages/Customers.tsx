import CustomerForm from "@/components/CustomerForm";
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Customer } from "@/types/types";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function Customers() {
  const navigate = useNavigate()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [sort, setSort] = useState<string>("")
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [refresh, setRefresh] = useState<number>(0)

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {

        const options = { credentials: "include" as const, headers: { "Content-Type": "application/json" } }
        const url = "http://localhost:8080"

        const customersRes = await fetch(url + `/customers?limit=20&offset=${(page - 1) * 20}&search=${debouncedSearch}&sort=${sort}&order=${order}`, options)

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
  }, [debouncedSearch, page, sort, order, refresh])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSort = (column: string) => {
    if (sort === column) {
      setOrder(o => o === "asc" ? "desc" : "asc")
    } else {
      setSort(column)
      setOrder("asc")
    }
    setPage(1)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/customers/${id}`, {
        method: "PATCH",
        credentials: "include" as const,
      })

      if (!res.ok) {
        throw new Error("Failed to delete customer")
      }

      setRefresh(r => r + 1)
    } catch (e) {
      console.log(e)
    }
  }


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center gap-3">
          <Button onClick={() => setSelectedCustomer({ ID: 0, FirstName: "", LastName: "", Email: "", IsActive: true })}>Add Customer</Button>
        </div>

      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("first_name")}
              >
                <span className="flex items-center gap-1">
                  First Name {sort === "first_name" ? (order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("last_name")}
              >
                <span className="flex items-center gap-1">
                  Last Name {sort === "last_name" ? (order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:text-foreground"
                onClick={() => handleSort("email")}
              >
                <span className="flex items-center gap-1">
                  Email {sort === "email" ? (order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </span>
              </TableHead>
              <TableHead>Actions</TableHead>
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
                  <TableRow className="cursor-pointer" key={customer.ID} onClick={() => navigate(`/customers/${customer.ID}`)}>
                    <TableCell className="font-medium">{customer.FirstName}</TableCell>
                    <TableCell className="font-medium">{customer.LastName}</TableCell>
                    <TableCell>{customer.Email}</TableCell>
                    <TableCell onClick={(e) => (e.stopPropagation())}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setSelectedCustomer(customer)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDelete(customer.ID)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                  </TableRow>
                )}
          </TableBody>
        </Table >
      </div>


      <Sheet open={selectedCustomer !== null} onOpenChange={(open) => { if (!open) setSelectedCustomer(null) }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedCustomer?.ID === 0 ? "Create Customer" : "Edit Customer"}</SheetTitle>
          </SheetHeader>
          <CustomerForm customer={selectedCustomer} onSuccess={() => {
            setSelectedCustomer(null)
            setRefresh(r => r + 1)
          }} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => p + 1)}
          disabled={customers.length < 20 || loading}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

