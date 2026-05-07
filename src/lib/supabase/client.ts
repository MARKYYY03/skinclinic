import { createBrowserClient } from "@supabase/ssr"

function getBrowserEnv(): { url: string; anon: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }
  return { url, anon }
}

/** Browser Supabase client (Client Components only). */
export function createClient() {
  const { url, anon } = getBrowserEnv()
  return createBrowserClient(url, anon)
}

/** Shared browser instance for call sites using `supabaseClient`. */
const browserEnv = getBrowserEnv()
export const supabaseClient = createBrowserClient(browserEnv.url, browserEnv.anon)
