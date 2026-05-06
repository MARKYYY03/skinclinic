"use server"

import { revalidatePath } from "next/cache"

import { createServerSupabaseClient } from "@/lib/supabase/server"

type PackageTemplateInput = {
  name: string
  serviceId: string
  sessionCount: 3 | 5 | 10 | 15
  price: number
  validityDays: number
  isActive: boolean
}

async function assertCanManagePackages() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) return { ok: false as const, error: "Not signed in." }

  const { data: me } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle()

  if (!me || (me.role !== "Owner" && me.role !== "Admin")) {
    return { ok: false as const, error: "Only Owner or Admin can manage package templates." }
  }

  return { ok: true as const, supabase, userId: user.id }
}

export async function createServicePackageAction(
  input: PackageTemplateInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const auth = await assertCanManagePackages()
  if (!auth.ok) return auth

  const { data, error } = await auth.supabase
    .from("service_packages")
    .insert({
      name: input.name.trim(),
      service_id: input.serviceId,
      session_count: input.sessionCount,
      price: input.price,
      validity_days: input.validityDays,
      is_active: input.isActive,
    })
    .select("id")
    .single()

  if (error || !data) return { ok: false, error: error?.message ?? "Failed to create package." }

  revalidatePath("/packages")
  revalidatePath(`/packages/${data.id}`)
  return { ok: true, id: data.id }
}

export async function updateServicePackageAction(
  packageId: string,
  input: PackageTemplateInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await assertCanManagePackages()
  if (!auth.ok) return auth

  const { error } = await auth.supabase
    .from("service_packages")
    .update({
      name: input.name.trim(),
      service_id: input.serviceId,
      session_count: input.sessionCount,
      price: input.price,
      validity_days: input.validityDays,
      is_active: input.isActive,
    })
    .eq("id", packageId)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/packages")
  revalidatePath(`/packages/${packageId}`)
  return { ok: true }
}

export async function transferClientPackageAction(input: {
  clientPackageId: string
  recipientClientId: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
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

  if (!me || (me.role !== "Owner" && me.role !== "Admin" && me.role !== "Cashier")) {
    return { ok: false, error: "You do not have permission to transfer packages." }
  }

  const { data: previousRow, error: loadErr } = await supabase
    .from("client_packages")
    .select(
      "id, client_id, package_id, package_name, service_name, total_sessions, sessions_used, sessions_remaining, price_paid, purchased_at, expires_at, is_transferable, transferred_to_client, transaction_id",
    )
    .eq("id", input.clientPackageId)
    .maybeSingle()

  if (loadErr || !previousRow) {
    return { ok: false, error: loadErr?.message ?? "Package record not found." }
  }
  if (!previousRow.is_transferable) {
    return { ok: false, error: "This package is no longer transferable." }
  }
  if (previousRow.client_id === input.recipientClientId) {
    return { ok: false, error: "Recipient client is already the package owner." }
  }

  const updatePayload = {
    client_id: input.recipientClientId,
    transferred_to_client: input.recipientClientId,
    is_transferable: false,
  }

  const { data: updatedRow, error: updateErr } = await supabase
    .from("client_packages")
    .update(updatePayload)
    .eq("id", input.clientPackageId)
    .select(
      "id, client_id, package_id, package_name, service_name, total_sessions, sessions_used, sessions_remaining, price_paid, purchased_at, expires_at, is_transferable, transferred_to_client, transaction_id",
    )
    .single()

  if (updateErr || !updatedRow) {
    return { ok: false, error: updateErr?.message ?? "Failed to transfer package." }
  }

  const { error: auditErr } = await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "UPDATE",
    table_name: "client_packages",
    record_id: input.clientPackageId,
    old_data: previousRow,
    new_data: updatedRow,
  })

  if (auditErr) return { ok: false, error: auditErr.message }

  revalidatePath("/clients")
  revalidatePath("/packages")
  revalidatePath("/settings/audit-log")
  return { ok: true }
}
