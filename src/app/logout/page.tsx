"use client"

import { signOut } from "next-auth/react"

export default function LogoutPage() {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <main className="flex flex-col items-center text-center space-y-4">
      <h1 className="text-2xl font-bold">
        Abmelden
      </h1>
      <p className="text-muted-foreground">
        Möchten Sie sich wirklich abmelden?
      </p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer w-full"
      >
        Jetzt abmelden
      </button>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        Zurück
      </button>
    </main>
  )
}
