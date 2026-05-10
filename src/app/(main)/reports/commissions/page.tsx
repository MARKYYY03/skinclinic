"use client"

import { useEffect, useMemo, useState } from "react"

import CommissionReportTable from "@/components/reports/CommissionReportTable"
import ExportButton from "@/components/reports/ExportButton"
import ReportFilters from "@/components/reports/ReportFilters"
import { supabaseClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"

export default function CommissionsReportPage() {
  const now = new Date()
  const [startDate, setStartDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
  )
  const [endDate, setEndDate] = useState(
    new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
  )
  const [staffFilter, setStaffFilter] = useState("All")
  const [baseRows, setBaseRows] = useState<
    Array<{
      staffName: string
      transactionId: string
      serviceName: string
      commissionAmount: number
      grossAmount: number
      rate: number
      poolShare: number
      date: string
    }>
  >([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: commRows } = await supabaseClient
        .from("commissions")
        .select("transaction_id, staff_id, gross_amount, rate, pool_share, commission_amount, created_at")
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59`)

      const txIds = Array.from(new Set((commRows ?? []).map((r) => r.transaction_id)))
      const staffIds = Array.from(new Set((commRows ?? []).map((r) => r.staff_id)))
      const [{ data: txItemRows }, { data: staffRows }] = await Promise.all([
        txIds.length
          ? supabaseClient
              .from("transaction_items")
              .select("transaction_id, item_name, item_type")
              .in("transaction_id", txIds)
          : Promise.resolve({ data: [] as Array<{ transaction_id: string; item_name: string; item_type: string }> }),
        staffIds.length
          ? supabaseClient.from("profiles").select("id, full_name").in("id", staffIds)
          : Promise.resolve({ data: [] as Array<{ id: string; full_name: string }> }),
      ])

      const staffNameById = new Map((staffRows ?? []).map((s) => [s.id, s.full_name]))
      const firstServiceByTx = new Map<string, string>()
      ;(txItemRows ?? []).forEach((row) => {
        if (row.item_type !== "service") return
        if (!firstServiceByTx.has(row.transaction_id)) firstServiceByTx.set(row.transaction_id, row.item_name)
      })

      const mapped = (commRows ?? []).map((row) => ({
        staffName: staffNameById.get(row.staff_id) ?? "Unknown Staff",
        transactionId: row.transaction_id,
        serviceName: firstServiceByTx.get(row.transaction_id) ?? "Service",
        commissionAmount: Number(row.commission_amount ?? 0),
        grossAmount: Number(row.gross_amount ?? 0),
        rate: Number(row.rate ?? 0),
        poolShare: Number(row.pool_share ?? 0),
        date: row.created_at.slice(0, 10),
      }))
      if (!cancelled) setBaseRows(mapped)
    })()
    return () => {
      cancelled = true
    }
  }, [endDate, startDate])

  const staffOptions = useMemo(
    () => Array.from(new Set(baseRows.map((row) => row.staffName))),
    [baseRows],
  )

  const rows = useMemo(
    () =>
      baseRows.filter(
        (row) => staffFilter === "All" || row.staffName === staffFilter,
      ),
    [baseRows, staffFilter],
  )

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + row.commissionAmount, 0),
    [rows],
  )
  const summaryRows = useMemo(() => {
    const map = new Map<string, { txSet: Set<string>; total: number }>()
    rows.forEach((row) => {
      const current = map.get(row.staffName) ?? { txSet: new Set<string>(), total: 0 }
      current.txSet.add(row.transactionId)
      current.total += row.commissionAmount
      map.set(row.staffName, current)
    })
    return Array.from(map.entries()).map(([staffName, value]) => ({
      staffName,
      transactionCount: value.txSet.size,
      totalCommissionEarned: value.total,
    }))
  }, [rows])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900">Commission Report</h3>
        <ExportButton
          filename="commission-report.csv"
          headers={[
            "Date",
            "Staff",
            "Transaction",
            "Service",
            "Gross Amount",
            "Rate",
            "Pool Share",
            "Commission",
          ]}
          rows={rows.map((row) => [
            row.date,
            row.staffName,
            row.transactionId,
            row.serviceName,
            row.grossAmount,
            row.rate,
            row.poolShare,
            row.commissionAmount,
          ])}
        />
      </div>

      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <select
          value={staffFilter}
          onChange={(event) => setStaffFilter(event.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
          style={{ backgroundColor: '#ffffff', color: '#000000', colorScheme: 'light' }}
          aria-label="Filter report by staff"
          title="Staff filter"
        >
          <option value="All" style={{ backgroundColor: '#ffffff', color: '#000000' }}>All Staff</option>
          {staffOptions.map((staff) => (
            <option key={staff} value={staff} style={{ backgroundColor: '#ffffff', color: '#000000' }}>
              {staff}
            </option>
          ))}
        </select>
        <div className="rounded border border-gray-200 bg-white px-3 py-2">
          <p className="text-xs text-gray-500">Total Commission</p>
          <p className="font-semibold text-gray-900">{formatCurrency(total)}</p>
        </div>
      </div>

      <CommissionReportTable summaryRows={summaryRows} detailRows={rows} />
    </div>
  )
}
