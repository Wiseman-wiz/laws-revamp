"use client"

import { useActionState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authenticate } from "@/app/actions/auth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  )

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>
              {errorMessage && (
                <p className="text-sm text-destructive text-center">{errorMessage}</p>
              )}
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Logging in..." : "Login"}
                </Button>
                <Button variant="outline" type="button" disabled={isPending}>
                  Login with Google
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account? <a href="#" className="underline">Sign up</a>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
