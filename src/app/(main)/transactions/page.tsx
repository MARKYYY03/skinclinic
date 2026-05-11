"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"

import PageWrapper from "@/components/layout/PageWrapper"
import TransactionTable from "@/components/transactions/TransactionTable"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import type { Transaction } from "@/types/transaction"

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function thirtyDaysAgoISO() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgoISO)
  const [dateTo, setDateTo] = useState(todayISO)
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const load = useCallback(async () => {
    const { data: txRows } = await supabaseClient
      .from("transactions")
      .select(
        "id, client_id, client_name, total_amount, discount_total, net_amount, amount_paid, balance_due, notes, status, created_by, created_at",
      )
      .order("created_at", { ascending: false })

    const txIds = (txRows ?? []).map((t) => t.id)
    const createdByIds = Array.from(
      new Set((txRows ?? []).map((t) => t.created_by).filter(Boolean)),
    ) as string[]

    const [{ data: itemRows }, { data: paymentRows }, { data: staffRows }, { data: profileRows }] =
      await Promise.all([
        txIds.length
          ? supabaseClient
              .from("transaction_items")
              .select(
                "transaction_id, item_type, service_id, product_id, item_name, quantity, unit_price, discount, total",
              )
              .in("transaction_id", txIds)
          : Promise.resolve({ data: [] as Record<string, unknown>[] }),
        txIds.length
          ? supabaseClient
              .from("transaction_payments")
              .select("transaction_id, method, amount")
              .in("transaction_id", txIds)
          : Promise.resolve({ data: [] as Record<string, unknown>[] }),
        txIds.length
          ? supabaseClient
              .from("transaction_staff")
              .select("transaction_id, staff_id")
              .in("transaction_id", txIds)
          : Promise.resolve({ data: [] as Record<string, unknown>[] }),
        createdByIds.length
          ? supabaseClient
              .from("profiles")
              .select("id, full_name")
              .in("id", createdByIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
      ])

    const profileById = new Map((profileRows ?? []).map((p) => [p.id, p.full_name]))
    const itemsByTx = new Map<string, Transaction["items"]>()
    for (const row of itemRows ?? []) {
      const r = row as {
        transaction_id: string
        item_type: "service" | "product"
        service_id: string | null
        product_id: string | null
        item_name: string
        quantity: number
        unit_price: number
        discount: number
        total: number
      }
      const list = itemsByTx.get(r.transaction_id) ?? []
      list.push({
        type: r.item_type,
        referenceId: r.service_id ?? r.product_id ?? r.transaction_id,
        name: r.item_name,
        quantity: r.quantity,
        unitPrice: Number(r.unit_price ?? 0),
        discount: Number(r.discount ?? 0),
        total: Number(r.total ?? 0),
      })
      itemsByTx.set(r.transaction_id, list)
    }
    const paymentsByTx = new Map<string, Transaction["payments"]>()
    for (const row of paymentRows ?? []) {
      const r = row as { transaction_id: string; method: Transaction["payments"][0]["method"]; amount: number }
      const list = paymentsByTx.get(r.transaction_id) ?? []
      list.push({ method: r.method, amount: Number(r.amount ?? 0) })
      paymentsByTx.set(r.transaction_id, list)
    }
    const staffByTx = new Map<string, string[]>()
    for (const row of staffRows ?? []) {
      const r = row as { transaction_id: string; staff_id: string }
      staffByTx.set(r.transaction_id, [...(staffByTx.get(r.transaction_id) ?? []), r.staff_id])
    }

    const mapped: Transaction[] = (txRows ?? []).map((row) => ({
      id: row.id,
      clientId: row.client_id ?? "",
      clientName: row.client_name,
      items: itemsByTx.get(row.id) ?? [],
      payments: paymentsByTx.get(row.id) ?? [],
      totalAmount: Number(row.total_amount ?? 0),
      discountTotal: Number(row.discount_total ?? 0),
      netAmount: Number(row.net_amount ?? 0),
      amountPaid: Number(row.amount_paid ?? 0),
      balanceDue: Number(row.balance_due ?? 0),
      staffIds: staffByTx.get(row.id) ?? [],
      notes: row.notes ?? undefined,
      status: row.status as Transaction["status"],
      createdBy: profileById.get(row.created_by ?? "") ?? "Unknown",
      createdAt: row.created_at,
    }))

    setTransactions(mapped)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(id)
  }, [load])

  const filteredTransactions = useMemo(() => {
    const fromTs = new Date(`${dateFrom}T00:00:00`).getTime()
    const toTs = new Date(`${dateTo}T23:59:59.999`).getTime()
    const q = searchQuery.trim().toLowerCase()

    return transactions.filter((t) => {
      const tMs = new Date(t.createdAt).getTime()
      const inRange = tMs >= fromTs && tMs <= toTs
      const matchStatus = statusFilter === "All" || t.status === statusFilter
      const matchSearch =
        !q || t.clientName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      return inRange && matchStatus && matchSearch
    })
  }, [dateFrom, dateTo, searchQuery, statusFilter, transactions])

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1f2918]">Transactions</h2>
            <p className="mt-1 text-sm text-[#5c564c]">Sales log and billing history</p>
          </div>
          <Link
            href="/transactions/new"
            className="inline-flex items-center justify-center rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
          >
            New Transaction
          </Link>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-white dark:text-black"
                aria-label="Date from"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-white dark:text-black"
                aria-label="Date to"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-white dark:text-black"
                aria-label="Status filter"
              >
                <option value="All" className="bg-white text-black dark:bg-white dark:text-black">
                  All
                </option>
                <option
                  value="Completed"
                  className="bg-white text-black dark:bg-white dark:text-black"
                >
                  Completed
                </option>
                <option
                  value="Partial"
                  className="bg-white text-black dark:bg-white dark:text-black"
                >
                  Partial
                </option>
                <option
                  value="Voided"
                  className="bg-white text-black dark:bg-white dark:text-black"
                >
                  Voided
                </option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Client</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name…"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-white dark:text-black"
                aria-label="Search by client name"
              />
            </label>
          </div>
        </div>

        <TransactionTable transactions={filteredTransactions} />
      </div>
    </PageWrapper>
  )
}
