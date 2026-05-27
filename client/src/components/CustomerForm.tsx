import { createCustomer, updateCustomer } from "@/api/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Customer, CustomersFormProps } from "@/types/types"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

export default function CustomerForm({ customer, onSuccess }: CustomersFormProps) {
  const [formData, setFormData] = useState<Customer>(
    customer ?? { ID: 0, FirstName: "", LastName: "", Email: "", IsActive: true }
  )

  const isEditing = customer?.ID !== 0

  const mutation = useMutation({
    mutationFn: () => isEditing
      ? updateCustomer(formData.ID, { firstName: formData.FirstName, lastName: formData.LastName, email: formData.Email })
      : createCustomer({ firstName: formData.FirstName, lastName: formData.LastName, email: formData.Email }),
    onSuccess: () => {
      toast.success(isEditing ? "Customer updated" : "Customer created")
      onSuccess()
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "An unexpected error occurred"),
  })

  return (
    <div className="flex flex-col gap-5 mt-4 px-1">
      <div className="space-y-1.5">
        <Label htmlFor="firstName">First Name</Label>
        <Input id="firstName" className="max-w-xs" value={formData.FirstName} onChange={e => setFormData({ ...formData, FirstName: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lastName">Last Name</Label>
        <Input id="lastName" className="max-w-xs" value={formData.LastName} onChange={e => setFormData({ ...formData, LastName: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" className="max-w-xs" value={formData.Email} onChange={e => setFormData({ ...formData, Email: e.target.value })} />
      </div>
      <div className="pt-2">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
