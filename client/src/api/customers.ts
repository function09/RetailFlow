import type { Customer, Order } from "@/types/types"

const BASE_URL = import.meta.env.VITE_API_URL

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${BASE_URL}/customers?limit=500&offset=0`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function getCustomer(customerID: string): Promise<Customer> {
  const res = await fetch(`${BASE_URL}/customers/${customerID}`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function getCustomerOrders(customerID: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/customers/${customerID}/orders`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}
