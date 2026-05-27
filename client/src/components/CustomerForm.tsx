import { createCustomer, updateCustomer } from "@/api/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <div className="flex flex-col gap-4 mt-4">
      <div>
        <label>First Name</label>
        <Input value={formData.FirstName} onChange={e => {
          setFormData({ ...formData, FirstName: e.target.value })
        }} />
      </div>
      <div>
        <label>Last Name</label>
        <Input value={formData.LastName} onChange={e => {
          setFormData({ ...formData, LastName: e.target.value })
        }} />
      </div>
      <div>
        <label>Email</label>
        <Input value={formData.Email} onChange={e => {
          setFormData({ ...formData, Email: e.target.value })
        }} />
      </div>
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>Save</Button>
    </div>
  )
}
