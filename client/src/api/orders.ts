import type { Order, OrderDetails, CreateOrderPayload } from "../types/types"

const BASE_URL = import.meta.env.VITE_API_URL

export async function getOrders(limit: number, offset: number, search: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/orders?limit=${limit}&offset=${offset}&search=${search}`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function updateOrderStatus(id: number, status: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function getOrderDetails(id: string): Promise<OrderDetails> {
  const res = await fetch(`${BASE_URL}/orders/${id}/details`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}
