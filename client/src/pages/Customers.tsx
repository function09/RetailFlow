import { deactivateCustomer, getCustomers } from "@/api/customers";
import CustomerForm from "@/components/CustomerForm";
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Customer } from "@/types/types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Customers() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [sort, setSort] = useState<string>("")
  const [order, setOrder] = useState<"asc" | "desc">("asc")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const { data, isLoading, isError, isPlaceholderData } = useQuery({ queryKey: ["customers", debouncedSearch, page, sort, order], queryFn: () => getCustomers(20, (page - 1) * 20, debouncedSearch, sort, order), placeholderData: keepPreviousData })

  const mutation = useMutation({
    mutationFn: deactivateCustomer, onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer profile successfully disabled")
    },
    onError: (e) => { toast.error(e instanceof Error ? e.message : "An unexpected error occured") }
  })

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
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Failed to load customers.
                </TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) :
                (data ?? []).map((customer) =>
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
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => mutation.mutate(customer.ID)}>Deactivate</DropdownMenuItem>
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
            queryClient.invalidateQueries({ queryKey: ["customers"] })
          }} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!isPlaceholderData) {
              setPage(p => p + 1)
            }
          }}
          disabled={(data?.length ?? 0) < 20 || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

