"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const search = useSearchParams()
  const callbackUrl = search.get("callbackUrl") || "/"

  const guardUrl = useMemo(() => {
    // Build the external IdP /login URL
    const base = process.env.NEXT_PUBLIC_GUARD_SSO_BASE!
    const u = new URL("/login", base)
    const redirectUri = `${location!.origin}/auth/callback/guard`
    u.searchParams.set("redirect_uri", redirectUri)
    u.searchParams.set("state", callbackUrl) // preserves original destination
    return u.toString()
  }, [callbackUrl])

  const snowflakeUrl = useMemo(() => {
    // Build the external IdP /login URL
    const base = process.env.NEXT_PUBLIC_SNOWFLAKE_SSO_BASE!
    const u = new URL("/sso", base)
    const redirectUri = `${location!.origin}/auth/callback/snowflake?state=${callbackUrl}`
    u.searchParams.set("callback_url", redirectUri)
    return u.toString()
  }, [callbackUrl])

  return (
    <main style={{ padding: 24 }}>
      <h1 className="mb-4 text-2xl font-bold">
        Sign in
      </h1>
      <div className="flex flex-col">
        <a href={guardUrl}>
          <button className="mt-4 block cursor-pointer">Login mit Guard</button>
        </a>
        <a href={snowflakeUrl} className="mt-4 block">
          <button className="mt-4 block cursor-pointer">Login mit Snowflake</button>
        </a>
      </div>
    </main>
  )
}
