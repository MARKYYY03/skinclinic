import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types/user"

export interface ServerUserProfile {
  userId: string
  fullName: string
  role: UserRole
}

/** Current authenticated user + profile row (Server Components / Server Actions). */
export async function getServerUserProfile(): Promise<ServerUserProfile | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle()

  return {
    userId: user.id,
    fullName: profile?.full_name ?? user.email ?? "User",
    role: ((profile?.role as UserRole | undefined) ?? "Staff"),
  }
}
