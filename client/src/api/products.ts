import type { Categories, Products } from "@/types/types"

const BASE_URL = import.meta.env.VITE_API_URL

export async function getProducts(limit = 500, offset = 0, search = "", sort = "", order = "asc"): Promise<Products[]> {
  const res = await fetch(`${BASE_URL}/products?limit=${limit}&offset=${offset}&search=${search}&sort=${sort}&order=${order}`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function getCategories(): Promise<Categories[]> {
  const res = await fetch(`${BASE_URL}/categories`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

export async function createProduct(data: { name: string, sku: string, price: number, quantity: number, category_id: number }): Promise<void> {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}

export async function updateProduct(id: number, data: { name: string, sku: string, price: number, quantity: number, category_id: number }): Promise<void> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}
