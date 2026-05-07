import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import type { UserRole } from "@/types/user"

function getEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export type UserDirectoryRow = {
  id: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  email: string | null
}

export async function GET(req: Request) {
  try {
    const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
    const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

    const authHeader = req.headers.get("authorization") ?? ""
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7)
      : ""
    if (!token) {
      return NextResponse.json({ error: "Missing bearer token." }, { status: 401 })
    }

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    const { data: callerUserData, error: callerUserErr } =
      await callerClient.auth.getUser(token)
    if (callerUserErr || !callerUserData.user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 })
    }

    const { data: callerProfile, error: callerProfileErr } = await callerClient
      .from("profiles")
      .select("role")
      .eq("id", callerUserData.user.id)
      .maybeSingle()

    if (callerProfileErr) {
      return NextResponse.json({ error: callerProfileErr.message }, { status: 403 })
    }

    if (
      !callerProfile ||
      (callerProfile.role !== "Owner" && callerProfile.role !== "Admin")
    ) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    const { data: profiles, error: profilesErr } = await adminClient
      .from("profiles")
      .select("id, full_name, role, is_active, created_at")
      .order("created_at", { ascending: false })

    if (profilesErr) {
      return NextResponse.json({ error: profilesErr.message }, { status: 400 })
    }

    const { data: listed, error: listErr } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 400 })
    }

    const emailById = new Map<string, string>()
    for (const u of listed.users) {
      if (u.email) emailById.set(u.id, u.email)
    }

    const users: UserDirectoryRow[] = (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      role: p.role as UserRole,
      is_active: p.is_active,
      created_at: p.created_at,
      email: emailById.get(p.id) ?? null,
    }))

    return NextResponse.json({ users }, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 },
    )
  }
}
