import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthContext } from "@/context/AuthContext"
import { useContext } from "react"

export function DashBoard() {
  const { user } = useContext(AuthContext)
  return (
    <div>

      <div>Welcome {user?.sub}</div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div>45</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div>21</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div>100</div>
        </CardContent>
      </Card>
    </div>)
}
