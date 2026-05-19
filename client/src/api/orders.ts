import type { Order } from "../types/types"

const BASE_URL = "http://localhost:8080"

export async function getOrders(limit: number, offset: number, search: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/orders?limit=${limit}&offset=${offset}&search=${search}`, { credentials: "include" })

  if (!res.ok) {
    throw new Error("Failed to fetch orders")
  }

  return res.json()
}
