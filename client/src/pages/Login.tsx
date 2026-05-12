import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useContext, useState, type SubmitEventHandler } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {

      const url: string = "http://localhost:8080/auth/login"

      const headers: Headers = new Headers()
      headers.append("Content-Type", "application/json")

      const response: Response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ username, password })
      })

      let message: string
      if (!response.ok) {
        message = await response.text()
        toast.error(message)
      } else {
        await authContext.checkAuth()
        navigate("/dashboard")
      }

    } catch (e) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Card >
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={loading}>
              Login
              {loading && <Loader2 className="animate-spin" />}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div >
  )

}

