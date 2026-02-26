import type { NextAuthConfig } from "next-auth"

export default {
  providers: [], // Providers added in auth.ts
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname === "/login"

      if (!isLoggedIn && !isOnLoginPage) {
        return false // Redirect to login
      }
      if (isLoggedIn && (isOnLoginPage || nextUrl.pathname === "/")) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as "Supervisor" | "Specialist" | "Staff" | undefined
      }
      return session
    },
  },
} satisfies NextAuthConfig
