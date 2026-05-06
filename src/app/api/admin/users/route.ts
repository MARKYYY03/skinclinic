import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import type { UserRole } from "@/types/user"

type CreateUserBody = {
  email: string
  full_name: string
  role: UserRole
  password: string
}

function getEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
    const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

    const authHeader = req.headers.get("authorization") ?? ""
    const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : ""
    if (!token) return NextResponse.json({ error: "Missing bearer token." }, { status: 401 })

    const body = (await req.json()) as Partial<CreateUserBody>
    const email = (body.email ?? "").trim().toLowerCase()
    const fullName = (body.full_name ?? "").trim()
    const role = body.role
    const password = body.password ?? ""

    if (!email || !fullName || !role || !password) {
      return NextResponse.json(
        { error: "email, full_name, role, and password are required." },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }

    // Verify caller session + role using anon client + bearer token
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    const { data: callerUserData, error: callerUserErr } = await callerClient.auth.getUser(token)
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

    if (!callerProfile || (callerProfile.role !== "Owner" && callerProfile.role !== "Admin")) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 })
    }

    // Create/add user using service role (server-only)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    // Create real account with initial password
    const { data: createdData, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (createErr || !createdData.user) {
      return NextResponse.json({ error: createErr?.message ?? "Failed to add user." }, { status: 400 })
    }

    // Set desired role + name on profiles
    const { error: profileUpdateErr } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: createdData.user.id,
          full_name: fullName,
          role,
          is_active: true,
        },
        { onConflict: "id" },
      )

    if (profileUpdateErr) {
      return NextResponse.json({ error: profileUpdateErr.message }, { status: 400 })
    }

    return NextResponse.json({ id: createdData.user.id }, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 },
    )
  }
}

