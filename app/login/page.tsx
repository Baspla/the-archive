"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

function LoginButton({ callbackUrl }: { callbackUrl: string | null }) {
  const handleSignIn = () => {
    signIn("gnagplus", { callbackUrl: callbackUrl || "/" })
  }

  return (
    <button 
      onClick={handleSignIn}
      className="mt-4 block cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
    >
      Login mit GnagPlus
    </button>
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
