import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect } from "react";
import { Navigate } from "react-router";
import { Outlet } from "react-router";
import { toast } from "sonner";


export function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext)


  useEffect(() => {
    if (!user && !loading) {
      toast.error("Please login to view content")
    }
  }, [user, loading])

  if (loading) {
    return <div>Loading...</div>
  }


  if (!user) {
    return <Navigate to="/login" />
  }


  return (
    <Outlet />
  )
}


