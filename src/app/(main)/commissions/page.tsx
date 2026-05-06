"use client"

import { useEffect, useMemo, useState } from "react"

import PageWrapper from "@/components/layout/PageWrapper"
import CommissionTable from "@/components/commissions/CommissionTable"
import ExportButton from "@/components/reports/ExportButton"
import { formatCurrency } from "@/lib/utils"
import { supabaseClient } from "@/lib/supabase/client"

export default function CommissionsPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10)

  const [startDate, setStartDate] = useState(monthStart)
  const [endDate, setEndDate] = useState(monthEnd)
  const [staffFilter, setStaffFilter] = useState("All")
  const [rows, setRows] = useState<
    Array<{
      id: string
      date: string
      clientName: string
      serviceName: string
      grossAmount: number
      rate: number
      poolShare: number
      commissionAmount: number
      staffName: string
      staffId: string
      transactionId: string
    }>
  >([])
  const [meRole, setMeRole] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ data: auth }, { data: commRows }] = await Promise.all([
        supabaseClient.auth.getUser(),
        supabaseClient
        .from("commissions")
          .select(
            "id, transaction_id, staff_id, gross_amount, rate, pool_share, commission_amount, created_at",
          )
          .gte("created_at", `${startDate}T00:00:00`)
          .lte("created_at", `${endDate}T23:59:59`)
        .order("created_at", { ascending: false })
      ])

      const userId = auth.user?.id
      let currentRole: string | null = null
      if (userId) {
        const { data: me } = await supabaseClient
          .from("profiles")
          .select("id, role")
          .eq("id", userId)
          .maybeSingle()
        currentRole = me?.role ?? null
        if (!cancelled) setMeRole(currentRole)
      }

      const commRowsScoped =
        currentRole === "Staff" && userId
          ? (commRows ?? []).filter((row) => row.staff_id === userId)
          : (commRows ?? [])

      const txIds = Array.from(new Set(commRowsScoped.map((row) => row.transaction_id)))
      const staffIds = Array.from(new Set(commRowsScoped.map((row) => row.staff_id)))
      const [{ data: txItemRows }, { data: staffRows }, { data: txRows }] = await Promise.all([
        txIds.length
          ? supabaseClient
              .from("transaction_items")
              .select("transaction_id, item_name, item_type")
              .in("transaction_id", txIds)
          : Promise.resolve({
              data: [] as Array<{ transaction_id: string; item_name: string; item_type: string }>,
            }),
        staffIds.length
          ? supabaseClient.from("profiles").select("id, full_name").in("id", staffIds)
          : Promise.resolve({
              data: [] as Array<{ id: string; full_name: string | null }>,
            }),
        txIds.length
          ? supabaseClient.from("transactions").select("id, client_name").in("id", txIds)
          : Promise.resolve({ data: [] as Array<{ id: string; client_name: string | null }> }),
      ])

      const staffNameById = new Map((staffRows ?? []).map((s) => [s.id, s.full_name]))
      const firstServiceByTx = new Map<string, string>()
      const clientByTx = new Map((txRows ?? []).map((tx) => [tx.id, tx.client_name ?? "Walk-in"]))
      ;(txItemRows ?? []).forEach((row) => {
        if (row.item_type !== "service") return
        if (!firstServiceByTx.has(row.transaction_id)) firstServiceByTx.set(row.transaction_id, row.item_name)
      })

      if (!cancelled) {
        setRows(
          commRowsScoped.map((row) => ({
            id: row.id,
            date: row.created_at,
            clientName: clientByTx.get(row.transaction_id) ?? "Walk-in",
            serviceName: firstServiceByTx.get(row.transaction_id) ?? "Service",
            grossAmount: Number(row.gross_amount ?? 0),
            rate: Number(row.rate ?? 0),
            poolShare: Number(row.pool_share ?? 0),
            commissionAmount: Number(row.commission_amount ?? 0),
            staffName: staffNameById.get(row.staff_id) ?? "Unknown Staff",
            staffId: row.staff_id,
            transactionId: row.transaction_id,
          })),
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [startDate, endDate])

  const staffOptions = useMemo(
    () => Array.from(new Set(rows.map((entry) => entry.staffName))),
    [rows],
  )

  const filteredRows = useMemo(
    () =>
      rows.filter((entry) => staffFilter === "All" || entry.staffName === staffFilter),
    [rows, staffFilter],
  )

  const totalCommission = useMemo(
    () => filteredRows.reduce((sum, row) => sum + row.commissionAmount, 0),
    [filteredRows],
  )
  const totalTransactions = useMemo(
    () => new Set(filteredRows.map((r) => r.transactionId)).size,
    [filteredRows],
  )
  const averagePerTransaction =
    totalTransactions > 0 ? totalCommission / totalTransactions : 0

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-[#1f2918]">Commissions</h2>
            <p className="mt-1 text-[#6a6358]">Commission rows per staff per transaction.</p>
          </div>
          {(meRole === "Owner" || meRole === "Admin") && (
            <ExportButton
              filename="commissions.csv"
              headers={[
                "Date",
                "Staff",
                "Client",
                "Service",
                "Gross Amount",
                "Rate",
                "Pool Share",
                "Commission",
                "Transaction ID",
              ]}
              rows={filteredRows.map((r) => [
                r.date,
                r.staffName,
                r.clientName,
                r.serviceName,
                r.grossAmount,
                r.rate,
                r.poolShare,
                r.commissionAmount,
                r.transactionId,
              ])}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-[#314031]">Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#314031]">End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2"
            />
          </label>
          <select
            value={staffFilter}
            onChange={(event) => setStaffFilter(event.target.value)}
            className="self-end rounded-lg border border-[#cfc6ba] px-3 py-2"
            aria-label="Filter by staff"
            title="Staff filter"
          >
            <option value="All">All Staff</option>
            {staffOptions.map((staff) => (
              <option key={staff} value={staff}>
                {staff}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#dfd8cf] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#6a6358]">Total Commission</p>
            <p className="mt-1 text-2xl font-bold text-[#1f2918]">
              {formatCurrency(totalCommission)}
            </p>
          </div>
          <div className="rounded-xl border border-[#dfd8cf] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#6a6358]">Total Transactions</p>
            <p className="mt-1 text-2xl font-bold text-[#1f2918]">{totalTransactions}</p>
          </div>
          <div className="rounded-xl border border-[#dfd8cf] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#6a6358]">Average per Transaction</p>
            <p className="mt-1 text-2xl font-bold text-[#1f2918]">
              {formatCurrency(averagePerTransaction)}
            </p>
          </div>
        </div>

        <CommissionTable rows={filteredRows} />
      </div>
    </PageWrapper>
  )
}
