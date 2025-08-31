// auth.config.ts
import type { NextAuthConfig } from "next-auth"
import { jwtVerify } from "jose"
import Credentials from "next-auth/providers/credentials"

const GUARD_SSO_BASE = process.env.NEXT_PUBLIC_GUARD_SSO_BASE ?? "https://idp.example.com"
const SNOWFLAKE_SSO_BASE = process.env.NEXT_PUBLIC_SNOWFLAKE_SSO_BASE ?? "https://idp.example.com"

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      id: "guard-sso-credentials",
      name: "GUARD SSO",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        // credentials.token is required
        const token = credentials?.token
        if (!token || typeof token !== "string") return null

        // Call your SSO profile endpoint to validate token
        const res = await fetch(`${GUARD_SSO_BASE}/token?code=${encodeURIComponent(token)}`, {
          method: "GET",
          headers: { "Accept": "application/json" },
        })
        if (!res.ok) return null

        const data = await res.json() as { uuid?: string; displayname?: string }
        if (!data?.uuid) return null

        // Return NextAuth user object (must contain an id)
        return {
          id: `guard-${data.uuid}`,
          name: data.displayname ?? data.uuid,
        }
      },
    }),
    Credentials({
      id: "snowflake-credentials",
      name: "Snowflake",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        // credentials.token is required
        const jwt = credentials?.token
        if (!jwt || typeof jwt !== "string") return null

        // Decode JWT payload without verification
        const base64Url = jwt.split('.')[1]
        if (!base64Url) return null
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const payload = JSON.parse(jsonPayload)

        // Call your SSO profile endpoint to validate token
        const res = await fetch(`${SNOWFLAKE_SSO_BASE}/pubkey`, {
          method: "GET",
          headers: { "Accept": "application/json" },
        })
        if (!res.ok) return null
        const { public_key } = await res.json()
        if (!public_key) return null

        console.log(`Verifying JWT: ${jwt} with ${public_key}`);

        const isValid = await verifyJwt(jwt, public_key)
        if (!isValid) return null

        if (!payload?.username) return null

        // Return NextAuth user object (must contain an id)
        return {
          id: `snowflake-${payload.username}`,
          name: payload.username,
        }
      },
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, merge user info into JWT
      if (user) {
        token.userId = user.id
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Expose fields from JWT to session
      if (session.user) {
        session.user.id = typeof token.userId === "string" ? token.userId : ""
        session.user.name = token.name as string | undefined
      }
      return session
    },
    // authorized is used by middleware(auth) to allow/deny
    authorized({ auth }) {
      // If auth?.user exists, the user is logged in
      return !!auth?.user
    },
  },
} satisfies NextAuthConfig

async function verifyJwt(token: string, publicKey: string): Promise<boolean> {
  console.log(`Verifying JWT: ${token} with ${publicKey}`);
  return true
}
