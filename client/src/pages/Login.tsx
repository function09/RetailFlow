import { login } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)

  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const mutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: async () => {
      await authContext.checkAuth()
      navigate("/dashboard")
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again."),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Card>
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
            <Button type="submit" disabled={mutation.isPending}>
              Login
              {mutation.isPending && <Loader2 className="animate-spin" />}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
