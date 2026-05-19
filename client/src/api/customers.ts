import type { Customer } from "@/types/types"

const BASE_URL = "http://localhost:8080"

export async function getCustomer(customerID: string): Promise<Customer> {

  const res = await fetch(`${BASE_URL}/customers/${customerID}`, { credentials: "include" })

  if (!res.ok) {
    throw new Error("Failed to fetch customers")
  }

  return res.json()
}

