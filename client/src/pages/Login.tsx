import { login } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">RetailFlow</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" autoFocus />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-full mt-4" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="animate-spin" /> : "Sign in"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
