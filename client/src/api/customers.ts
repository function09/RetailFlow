import type { Customer, Order } from "@/types/types"

const BASE_URL = "http://localhost:8080"

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${BASE_URL}/customers?limit=500&offset=0`, { credentials: "include" })

  if (!res.ok) {
    throw new Error("Failed to fetch customers")
  }

  return res.json()
}

export async function getCustomer(customerID: string): Promise<Customer> {
  const res = await fetch(`${BASE_URL}/customers/${customerID}`, { credentials: "include" })

  if (!res.ok) {
    throw new Error("Failed to fetch customers")
  }

  return res.json()
}

export async function getCustomerOrders(customerID: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/customers/${customerID}/orders`, { credentials: "include" })

  if (!res.ok) {
    throw new Error("Failed to fetch customer orders")
  }

  return res.json()
}
