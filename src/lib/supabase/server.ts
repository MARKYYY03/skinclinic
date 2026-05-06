import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

function getServerEnv(): { url: string; anon: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }
  return { url, anon }
}

/** Server-side Supabase client (Server Components, Route Handlers, Server Actions). */
export async function createServerSupabaseClient() {
  const { url, anon } = getServerEnv()
  const cookieStore = await cookies()

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as never)
          })
        } catch {
          /* ignore when called outside a mutable Server Action context */
        }
      },
    },
  })
}
