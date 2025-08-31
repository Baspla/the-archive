// middleware.ts
import { NextResponse, NextRequest } from "next/server"
import { auth } from "@/auth"

// Configure which routes are protected.
// Example: everything under /app and /dashboard is protected.
const PROTECTED_PREFIXES = ["/app", "/protected"]

export default auth((req: NextRequest) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  // @ts-expect-error - provided by next-auth
  const isLoggedIn = !!req.auth

  if (!isLoggedIn && isProtected) {
    // Redirect to our custom login UI, carrying a callbackUrl param
    const loginUrl = new URL("/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.href)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  // Standard matcher that excludes static assets and Next internals
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
