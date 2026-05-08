"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"

import PageWrapper from "@/components/layout/PageWrapper"
import ReceiptView from "@/components/transactions/ReceiptView"
import { useCurrentUser } from "@/lib/auth/current-user"
import { voidTransactionAction } from "@/lib/actions/transactions"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import type { Transaction } from "@/types/transaction"

export default function TransactionDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { role } = useCurrentUser()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [voiding, setVoiding] = useState(false)
  const [voidConfirm, setVoidConfirm] = useState(false)

  const load = useCallback(async () => {
    const { data: tx } = await supabaseClient
      .from("transactions")
      .select(
        "id, client_id, client_name, total_amount, discount_total, net_amount, amount_paid, balance_due, notes, status, created_by, created_at",
      )
      .eq("id", id)
      .maybeSingle()
    if (!tx) {
      setTransaction(null)
      return
    }

    const [{ data: itemRows }, { data: paymentRows }, { data: staffRows }, cashierRes] =
      await Promise.all([
        supabaseClient
          .from("transaction_items")
          .select(
            "item_type, service_id, product_id, item_name, quantity, unit_price, discount, total, is_package_redemption",
          )
          .eq("transaction_id", id),
        supabaseClient.from("transaction_payments").select("method, amount").eq("transaction_id", id),
        supabaseClient.from("transaction_staff").select("staff_id").eq("transaction_id", id),
        tx.created_by
          ? supabaseClient.from("profiles").select("full_name").eq("id", tx.created_by).maybeSingle()
          : Promise.resolve({ data: null as { full_name: string } | null }),
      ])
    const cashierName = cashierRes.data?.full_name ?? "Unknown"

    const staffIds = (staffRows ?? []).map((row) => row.staff_id)
    const { data: staffProfiles } = staffIds.length
      ? await supabaseClient.from("profiles").select("id, full_name").in("id", staffIds)
      : { data: [] as { id: string; full_name: string }[] }

    const nameByStaff = new Map((staffProfiles ?? []).map((p) => [p.id, p.full_name]))

    const mapped: Transaction = {
      id: tx.id,
      clientId: tx.client_id ?? "",
      clientName: tx.client_name,
      items: (itemRows ?? []).map((row) => ({
        type: row.item_type as "service" | "product",
        referenceId: row.service_id ?? row.product_id ?? row.item_name,
        name: row.item_name,
        quantity: row.quantity,
        unitPrice: Number(row.unit_price ?? 0),
        discount: Number(row.discount ?? 0),
        total: Number(row.total ?? 0),
        isPackageRedemption: row.is_package_redemption ?? false,
      })),
      payments: (paymentRows ?? []).map((row) => ({
        method: row.method as Transaction["payments"][0]["method"],
        amount: Number(row.amount ?? 0),
      })),
      totalAmount: Number(tx.total_amount ?? 0),
      discountTotal: Number(tx.discount_total ?? 0),
      netAmount: Number(tx.net_amount ?? 0),
      amountPaid: Number(tx.amount_paid ?? 0),
      balanceDue: Number(tx.balance_due ?? 0),
      staffIds,
      staffNames: staffIds.map((sid) => nameByStaff.get(sid) ?? "Unknown"),
      notes: tx.notes ?? undefined,
      status: tx.status as Transaction["status"],
      createdBy: cashierName,
      createdAt: tx.created_at,
    }

    setTransaction(mapped)
  }, [id])

  useEffect(() => {
    const tid = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(tid)
  }, [load])

  const canVoid = role === "Owner" || role === "Admin"

  async function confirmVoid() {
    setVoiding(true)
    try {
      const r = await voidTransactionAction(id)
      if (!r.ok) throw new Error(r.error)
      setVoidConfirm(false)
      await load()
    } catch {
      /* keep modal open; user can retry */
    } finally {
      setVoiding(false)
    }
  }

  if (!transaction) {
    return (
      <PageWrapper>
        <div className="rounded-xl border border-[#dfd8cf] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1f2918]">Transaction not found</h2>
          <p className="mt-1 text-sm text-[#6a6358]">No data for ID: {id}</p>
          <Link
            href="/transactions"
            className="mt-4 inline-block rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
          >
            Back to Transactions
          </Link>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="mb-4 print:hidden">
        <Link
          href="/transactions"
          className="text-sm font-medium text-[#6B7A3E] hover:text-[#5a6734]"
        >
          ← Back to Transactions
        </Link>
      </div>

      <ReceiptView
        transaction={transaction}
        canVoid={canVoid}
        voiding={voiding}
        onVoid={() => setVoidConfirm(true)}
      />

      {voidConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-w-md rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-xl">
            <p className="text-sm font-medium text-[#1f2918]">
              Void this transaction? Status will be set to Voided. This cannot be undone from the
              UI.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVoidConfirm(false)}
                className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm text-[#314031]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={voiding}
                onClick={() => void confirmVoid()}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                Confirm void
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageWrapper>
  )
}
