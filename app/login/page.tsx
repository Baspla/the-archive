"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

function LoginButton({ callbackUrl }: { callbackUrl: string }) {
  const [guardUrl, setGuardUrl] = useState("")

  useEffect(() => {
    // Only calculate guardUrl if window is defined (client-side)
    const base = process.env.NEXT_PUBLIC_GUARD_SSO_BASE!
    const u = new URL("/login", base)
    const redirectUri = `${window.location.origin}/auth/callback/guard`
    u.searchParams.set("redirect_uri", redirectUri)
    u.searchParams.set("state", callbackUrl || window.location.origin)
    setGuardUrl(u.toString())
  }, [callbackUrl])

  if (!guardUrl) {
    return null
  }
  return (
    <a href={guardUrl}>
      <button className="mt-4 block cursor-pointer">Login mit Guard</button>
    </a>
  )
}

export default function LoginPage() {
  const search = useSearchParams()
  const callbackUrl = search.get("callbackUrl")
  
  return (
    <main style={{ padding: 24 }}>
      <h1 className="mb-4 text-2xl font-bold">
        Sign in
      </h1>
      <div className="flex flex-col">
        <LoginButton callbackUrl={callbackUrl} />
      </div>
    </main>
  )
}
