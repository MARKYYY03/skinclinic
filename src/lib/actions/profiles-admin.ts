"use server"

import { createClient } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { UserRole } from "@/types/user"

function getEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export async function updateUserByOwnerAction(
  targetUserId: string,
  input: { role: UserRole; is_active: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) return { ok: false, error: "Not signed in." }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (me?.role !== "Owner") {
    return { ok: false, error: "Only the Owner can edit user roles and status." }
  }

  if (targetUserId === user.id) {
    return { ok: false, error: "You cannot edit your own account from this screen." }
  }

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const { error } = await adminClient
    .from("profiles")
    .update({
      role: input.role,
      is_active: input.is_active,
    })
    .eq("id", targetUserId)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/settings/users")
  return { ok: true }
}

export async function changeUserPasswordAction(
  targetUserId: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) return { ok: false, error: "Not signed in." }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (me?.role !== "Owner") {
    return { ok: false, error: "Only the Owner can change user passwords." }
  }

  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." }
  }

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath("/settings/users")
  return { ok: true }
}

export async function deleteUserAccountAction(
  targetUserId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) return { ok: false, error: "Not signed in." }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (me?.role !== "Owner") {
    return { ok: false, error: "Only the Owner can delete user accounts." }
  }

  if (targetUserId === user.id) {
    return { ok: false, error: "You cannot delete your own account." }
  }

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const { error } = await adminClient.auth.admin.deleteUser(targetUserId)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/settings/users")
  return { ok: true }
}
