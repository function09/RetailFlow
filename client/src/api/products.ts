import type { Products } from "@/types/types"

const BASE_URL = import.meta.env.VITE_API_URL

export async function getProducts(): Promise<Products[]> {
  const res = await fetch(`${BASE_URL}/products?limit=500&offset=0`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}

