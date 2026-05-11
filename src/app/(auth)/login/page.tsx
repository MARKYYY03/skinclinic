"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { loginUser } from "@/lib/backend/auth/login"
import { supabaseClient } from "@/lib/supabase/supabase-client"

function safeRedirectPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/dashboard"
  }
  return candidate
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = safeRedirectPath(searchParams.get("redirect"))

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"checking" | "logged_out" | "logged_in">(
    "checking",
  )

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession()
        if (cancelled) return
        if (error) {
          setStatus("logged_out")
          return
        }
        setStatus(data.session ? "logged_in" : "logged_out")
        if (data.session) router.replace(redirectParam)
      } catch {
        if (!cancelled) setStatus("logged_out")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router, redirectParam])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setError(null)
    try {
      await loginUser(email.trim(), password)
      router.push(redirectParam)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid email or password")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8] px-4 py-10">
      <div className="w-full max-w-[420px] rounded-xl border border-[#dfd8cf] bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight text-[#6B7A3E]">
            Relevare
          </p>
          <p className="mt-1 text-sm text-[#5c564c]">
            Clinic management — sign in to continue
          </p>
        </div>

        {status === "checking" ? (
          <p className="mt-6 text-center text-sm text-[#6a6358]">Checking session…</p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#314031]">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-[#cfc6ba] bg-[#F5F0E8]/40 px-3 py-2.5 text-black outline-none focus:border-[#6B7A3E] focus:ring-1 focus:ring-[#6B7A3E]"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#314031]">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-[#cfc6ba] bg-[#F5F0E8]/40 px-3 py-2.5 text-[#1f2918] outline-none focus:border-[#6B7A3E] focus:ring-1 focus:ring-[#6B7A3E]"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || submitting || status === "checking"}
            className="w-full rounded-lg bg-[#6B7A3E] px-4 py-2.5 text-sm font-semibold text-[#F5F0E8] transition hover:bg-[#5a6734] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#6a6358]">
          Accounts are created by your clinic administrator.
        </p>
      </div>
    </div>
  )
}
