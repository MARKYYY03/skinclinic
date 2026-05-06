"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { PaymentMethod } from "@/types/transaction"

export type CreateTransactionItemInput = {
  type: "service" | "product"
  serviceId: string | null
  productId: string | null
  itemName: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  isPackageRedemption: boolean
  clientPackageId: string | null
}

export type CreateTransactionPaymentInput = {
  method: PaymentMethod
  amount: number
}

export async function createTransactionAction(input: {
  clientId: string | null
  clientName: string
  totalAmount: number
  discountTotal: number
  netAmount: number
  notes: string | null
  items: CreateTransactionItemInput[]
  payments: CreateTransactionPaymentInput[]
  staffIds: string[]
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) return { ok: false, error: "Not signed in." }

  if (!input.clientName.trim()) {
    return { ok: false, error: "Client name is required." }
  }
  if (input.items.length === 0) {
    return { ok: false, error: "Add at least one line item." }
  }
  if (input.staffIds.length === 0) {
    return { ok: false, error: "Assign at least one staff member." }
  }

  const paid =
    Math.round(
      input.payments.reduce((s, p) => s + (p.amount > 0 ? p.amount : 0), 0) * 100,
    ) / 100
  const net = Math.round(input.netAmount * 100) / 100
  if (paid < 0 || paid > net + 0.01) {
    return { ok: false, error: "Invalid payment total." }
  }

  const status: "Completed" | "Partial" =
    net <= 0 || paid >= net - 0.009 ? "Completed" : "Partial"

  const { data: txRow, error: txErr } = await supabase
    .from("transactions")
    .insert({
      client_id: input.clientId,
      client_name: input.clientName.trim(),
      total_amount: input.totalAmount,
      discount_total: input.discountTotal,
      net_amount: input.netAmount,
      amount_paid: paid,
      status,
      notes: input.notes?.trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (txErr || !txRow) {
    return { ok: false, error: txErr?.message ?? "Failed to create transaction." }
  }

  const txId = txRow.id

  const itemRows = input.items.map((it) => ({
    transaction_id: txId,
    item_type: it.type,
    service_id: it.type === "service" ? it.serviceId : null,
    product_id: it.type === "product" ? it.productId : null,
    item_name: it.itemName,
    quantity: it.quantity,
    unit_price: it.unitPrice,
    discount: it.discount,
    total: it.total,
    is_package_redemption: it.isPackageRedemption,
    client_package_id: it.clientPackageId,
  }))

  const { error: itemsErr } = await supabase.from("transaction_items").insert(itemRows)
  if (itemsErr) {
    await supabase.from("transactions").delete().eq("id", txId)
    return { ok: false, error: itemsErr.message }
  }

  const paymentRows = input.payments
    .filter((p) => p.amount > 0)
    .map((p) => ({
      transaction_id: txId,
      method: p.method,
      amount: p.amount,
    }))

  if (paymentRows.length > 0) {
    const { error: payErr } = await supabase
      .from("transaction_payments")
      .insert(paymentRows)
    if (payErr) {
      await supabase.from("transactions").delete().eq("id", txId)
      return { ok: false, error: payErr.message }
    }
  }

  const staffRows = input.staffIds.map((staffId) => ({
    transaction_id: txId,
    staff_id: staffId,
  }))

  const { error: staffErr } = await supabase.from("transaction_staff").insert(staffRows)
  if (staffErr) {
    await supabase.from("transactions").delete().eq("id", txId)
    return { ok: false, error: staffErr.message }
  }

  const serviceItems = input.items.filter((item) => item.type === "service" && item.serviceId)
  if (serviceItems.length > 0) {
    const serviceIds = Array.from(new Set(serviceItems.map((item) => item.serviceId as string)))
    const { data: serviceRows } = await supabase
      .from("services")
      .select("id, commission_rate")
      .in("id", serviceIds)

    const rateByService = new Map(
      (serviceRows ?? []).map((row) => [row.id, Number(row.commission_rate ?? 0)]),
    )

    const serviceSubtotal = serviceItems.reduce((sum, item) => sum + Number(item.total ?? 0), 0)
    const weightedRate =
      serviceSubtotal > 0
        ? serviceItems.reduce((sum, item) => {
            const rate = rateByService.get(item.serviceId as string) ?? 0
            return sum + Number(item.total ?? 0) * rate
          }, 0) / serviceSubtotal
        : 0

    const poolShare = 1 / input.staffIds.length
    const commissionRows = input.staffIds.map((staffId) => ({
      transaction_id: txId,
      staff_id: staffId,
      gross_amount: net,
      rate: weightedRate,
      pool_share: poolShare,
      commission_amount: Math.round(net * (weightedRate / 100) * poolShare * 100) / 100,
    }))

    const { error: commErr } = await supabase.from("commissions").insert(commissionRows)
    if (commErr) {
      await supabase.from("transactions").delete().eq("id", txId)
      return { ok: false, error: commErr.message }
    }
  }

  revalidatePath("/transactions")
  revalidatePath(`/transactions/${txId}`)
  revalidatePath("/commissions")
  revalidatePath("/reports/commissions")
  return { ok: true, id: txId }
}

export async function voidTransactionAction(
  transactionId: string,
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

  if (me?.role !== "Owner" && me?.role !== "Admin") {
    return { ok: false, error: "Only Owner or Admin can void a transaction." }
  }

  const { error } = await supabase
    .from("transactions")
    .update({ status: "Voided" })
    .eq("id", transactionId)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/transactions")
  revalidatePath(`/transactions/${transactionId}`)
  return { ok: true }
}

export async function updateTransactionProcedureNotesAction(
  transactionId: string,
  input: {
    procedureNotes: string
    productsUsed: string
    observations: string
  },
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

  if (me?.role !== "Staff" && me?.role !== "Admin" && me?.role !== "Owner") {
    return { ok: false, error: "Only Staff or Admin can add procedure notes." }
  }

  const finalNotes = [
    input.procedureNotes.trim() ? `Procedure Notes:\n${input.procedureNotes.trim()}` : "",
    input.productsUsed.trim() ? `Products Used:\n${input.productsUsed.trim()}` : "",
    input.observations.trim() ? `Observations:\n${input.observations.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")

  const { error } = await supabase
    .from("transactions")
    .update({ notes: finalNotes || null })
    .eq("id", transactionId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/clients`)
  revalidatePath(`/transactions/${transactionId}`)
  return { ok: true }
}
