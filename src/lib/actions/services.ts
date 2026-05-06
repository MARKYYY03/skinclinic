"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ServiceUpdatePayload = {
  name: string
  description: string | null
  category: string | null
  price: number
  commission_rate: number
  is_active: boolean
}

async function assertCanManageServices() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) return { ok: false as const, error: "Not signed in." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "Owner" && profile?.role !== "Admin") {
    return { ok: false as const, error: "You do not have permission to manage services." }
  }

  return { ok: true as const, supabase }
}

export async function updateServiceAction(
  serviceId: string,
  payload: ServiceUpdatePayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await assertCanManageServices()
  if (!auth.ok) return auth

  const { error } = await auth.supabase
    .from("services")
    .update({
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      category: payload.category?.trim() || null,
      price: payload.price,
      commission_rate: payload.commission_rate,
      is_active: payload.is_active,
    })
    .eq("id", serviceId)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/services")
  revalidatePath("/settings/services")
  return { ok: true }
}

export async function setServiceActiveAction(
  serviceId: string,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await assertCanManageServices()
  if (!auth.ok) return auth

  const { error } = await auth.supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", serviceId)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/services")
  revalidatePath("/settings/services")
  return { ok: true }
}

export async function createServiceAction(input: {
  name: string
  description: string | null
  category: string | null
  price: number
  commission_rate: number
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await assertCanManageServices()
  if (!auth.ok) return auth

  const { data, error } = await auth.supabase
    .from("services")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      category: input.category?.trim() || null,
      price: input.price,
      commission_rate: input.commission_rate,
      is_active: true,
    })
    .select("id")
    .single()

  if (error || !data) return { ok: false, error: error?.message ?? "Insert failed." }

  revalidatePath("/services")
  revalidatePath("/settings/services")
  return { ok: true, id: data.id }
}
