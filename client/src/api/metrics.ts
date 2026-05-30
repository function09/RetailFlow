import type { Metrics } from "@/types/types"

const BASE_URL = import.meta.env.VITE_API_URL

export async function getMetrics(): Promise<Metrics> {
  const res = await fetch(`${BASE_URL}/metrics`, { credentials: "include" })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }

  return res.json()
}
