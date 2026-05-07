"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Client } from "@/types/client"

export type ClientFormPayload = Omit<Client, "id" | "createdAt">

function payloadToColumns(payload: ClientFormPayload) {
  return {
    full_name: payload.fullName.trim(),
    contact_number: payload.contactNumber.trim() || null,
    email:
      payload.email.trim() && payload.email !== "—"
        ? payload.email.trim()
        : null,
    address: payload.address.trim() || null,
    birthdate: payload.birthdate.trim() || null,
    gender: payload.gender,
    category: payload.category,
    medical_history: payload.medicalHistory?.trim() || null,
    allergies: payload.allergies?.trim() || null,
    notes: payload.notes?.trim() || null,
  }
}

export async function createClientAction(
  payload: ClientFormPayload,
): Promise<{ ok: true; clientId: string } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) return { ok: false, error: "Not signed in." }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profileRow?.role === "Staff") {
    return { ok: false, error: "You do not have permission to add clients." }
  }

  const cols = payloadToColumns(payload)
  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...cols,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error || !data) return { ok: false, error: error?.message ?? "Insert failed." }

  revalidatePath("/clients")
  return { ok: true, clientId: data.id }
}

export async function updateClientAction(
  clientId: string,
  payload: ClientFormPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) return { ok: false, error: "Not signed in." }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profileRow?.role !== "Owner" && profileRow?.role !== "Admin") {
    return { ok: false, error: "You do not have permission to edit clients." }
  }

  const cols = payloadToColumns(payload)
  const { error } = await supabase.from("clients").update(cols).eq("id", clientId)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/clients")
  revalidatePath(`/clients/${clientId}`)
  return { ok: true }
}
