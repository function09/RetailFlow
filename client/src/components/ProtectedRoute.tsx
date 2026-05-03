import { AuthContext } from "@/context/AuthContext";
import { useContext, type ReactNode } from "react";
import { Navigate } from "react-router";



export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useContext(AuthContext)


  if (loading) {
    return <div>Loading...</div>
  }


  if (!user) {
    return <Navigate to="/login" />
  }


  return children
}


