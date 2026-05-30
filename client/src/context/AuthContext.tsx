import { createContext, useEffect, useState, type ReactNode } from "react"
import { logout as logoutAPI } from "../api/auth"
import type { User } from "../types/types"

interface AuthContext {
  user: User | null
  loading: boolean
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContext>({ user: null, loading: true, checkAuth: async () => { }, logout: async () => { } })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = async () => {
    await logoutAPI()
    setUser(null)
  }

  const checkAuth = async () => {
    try {

      const response: Response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      })

      if (!response.ok) {
        setUser(null)
        return
      }
      const data = await response.json()
      setUser(data)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider >
  )

}
