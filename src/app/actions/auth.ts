"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const validatedFields = loginSchema.safeParse(
      Object.fromEntries(formData.entries()),
    )

    if (!validatedFields.success) {
      return "Invalid fields."
    }

    const { email, password } = validatedFields.data

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials."
        default:
          return "Something went wrong."
      }
    }
    throw error
  }
}

export async function logOut() {
  await signOut({ redirectTo: "/login" })
}
