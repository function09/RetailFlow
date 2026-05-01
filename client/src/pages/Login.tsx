import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, type SubmitEventHandler } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
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
        navigate("/dashboard")
      }

    } catch (e) {
      toast.error("Something went wrong. Please try again.")
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
            <Button type="submit">Login</Button>
          </CardContent>
        </Card>
      </form>
    </div >
  )

}

