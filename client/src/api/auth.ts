const BASE_URL = import.meta.env.VITE_API_URL

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message)
  }
}
