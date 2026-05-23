import type { Order, OrderDetails, CreateOrderPayload } from "../types/types"

const BASE_URL = "http://localhost:8080"

export async function getOrders(limit: number, offset: number, search: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/orders?limit=${limit}&offset=${offset}&search=${search}`, { credentials: "include" })

  if (!res.ok) {
    throw new Error("Failed to fetch orders")
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
    throw new Error("Failed to update order status")
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
    throw new Error("Failed to create order")
  }

  return res.json()
}

export async function getOrderDetails(id: string): Promise<OrderDetails> {
  const res = await fetch(`${BASE_URL}/orders/${id}/details`, { credentials: "include" })

  if (!res.ok) {
    throw new Error("Failed to fetch order details")
  }

  return res.json()
}
