import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Customers, CustomersFormProps } from "@/types/types"
import { useState } from "react"

export default function CustomerForm({ customer, onSuccess }: CustomersFormProps) {
  const [formData, setFormData] = useState<Customers>(
    customer ?? { ID: 0, FirstName: "", LastName: "", Email: "", IsActive: true }
  )

  const handleSubmit = async () => {
    try {
      const isEditing = customer?.ID !== 0
      const url = isEditing ? `http://localhost:8080/customers/${formData.ID}` : "http://localhost:8080/customers"
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.FirstName,
          lastName: formData.LastName,
          email: formData.Email
        }),
      })
      if (!res.ok) {
        throw new Error("Failed to save customer")
      }
      onSuccess()
    } catch (e) {
      console.log(e)
    }
  }

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
      <Button onClick={handleSubmit}>Save</Button>
    </div>
  )
}

