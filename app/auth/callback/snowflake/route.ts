// app/api/auth/external/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/auth"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  const state = url.searchParams.get("state") // original URL from middleware

  if (!token) {
    // No token – go to login page or error page
    return NextResponse.redirect(new URL("/login?error=missing_token", url.origin))
  }

  // Perform a server-side sign-in using the Credentials provider with the token
  // redirect: false to control final redirect
  const res = await signIn("snowflake-credentials", {
    token,
    redirect: false,
  })

  if (!res || res.error) {
    const dest = new URL("/", url.origin)
    dest.searchParams.set("error", res?.error ?? "CredentialsSignin")
    return NextResponse.redirect(dest)
  }

  // Successful sign-in: redirect to original state (or fallback to home)
  const destination = state && isSafeUrl(state, url.origin) ? state : "/"
  return NextResponse.redirect(destination)
}

// Basic safety check to prevent open redirects
function isSafeUrl(target: string, origin: string) {
  try {
    const u = new URL(target, origin)
    return u.origin === origin
  } catch {
    return false
  }
}
