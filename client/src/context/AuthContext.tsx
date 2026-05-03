import { createContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "../types/types"

interface AuthContext {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContext>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const checkAuth = async () => {
      try {

        const response: Response = await fetch("http://localhost:8080/auth/me", {
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
    checkAuth()
  }, [])


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider >
  )
}
