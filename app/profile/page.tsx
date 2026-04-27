import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ProfileClient from "./ProfileClient"

/**
 * /profile — Server Component (auth gateway)
 *
 * Why a Server Component?
 *   - Reads the Clerk session directly from the request cookie via `auth()`,
 *     avoiding the client-side `useUser()` race condition that, with Clerk
 *     production keys (custom Frontend API domain), caused a redirect loop
 *     between /profile and /login.
 *   - Once we have a verified `userId` + `email`, we pass them down to the
 *     client component as props. The client never has to "wait for Clerk".
 *
 * Auth flow:
 *   1. Middleware (middleware.ts) protects /profile via `auth.protect()`.
 *   2. This Server Component re-checks just in case, then loads the user's
 *      primary email from Clerk's API server-side.
 *   3. ProfileClient takes over with guaranteed-valid Clerk data.
 */
export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) {
    // Should be unreachable because of middleware, but kept as a safety net.
    redirect("/login")
  }

  const cu = await currentUser()
  const email =
    cu?.primaryEmailAddress?.emailAddress ??
    cu?.emailAddresses?.[0]?.emailAddress ??
    ""

  return <ProfileClient clerkUserId={userId} clerkEmail={email} />
}
