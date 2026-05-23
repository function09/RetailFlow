import type { Products } from "@/types/types"

const BASE_URL = "http://localhost:8080"

export async function getProducts(): Promise<Products[]> {
  const res = await fetch(`${BASE_URL}/products?limit=500&offset=0`, { credentials: "include" })

  if (!res.ok) {
    throw new Error("Failed to fetch products")
  }

  return res.json()
}

