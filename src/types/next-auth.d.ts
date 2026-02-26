import { DefaultSession } from "next-auth"

export type UserRole = "Supervisor" | "Specialist" | "Staff"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React context
   */
  interface Session {
    user: {
      /** The user's role. */
      role?: UserRole
    } & DefaultSession["user"]
  }

  interface User {
    role?: UserRole
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    role?: UserRole
  }
}
