import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { logOut } from "@/app/actions/auth"

export default async function Home() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>You are not logged in.</p>
        <a href="/login" className="underline mt-2">Go to Login</a>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.name}!</h1>
      <div className="bg-card border rounded-lg p-6 shadow-sm w-full max-w-md">
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>Role:</strong> {session.user.role || "N/A"}</p>

        <form action={logOut} className="mt-6">
          <Button type="submit" variant="destructive" className="w-full">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
