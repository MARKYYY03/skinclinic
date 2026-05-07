"use client"

import { useEffect, useState } from "react"
import ExportButton from "@/components/reports/ExportButton"
import ProfitLossTable from "@/components/reports/ProfitLossTable"
import ReportFilters from "@/components/reports/ReportFilters"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import type { ProfitLossRow } from "@/types/reports"

export default function ProfitLossReportPage() {
  const [startDate, setStartDate] = useState("2026-04-01")
  const [endDate, setEndDate] = useState("2026-05-31")
  const [rows, setRows] = useState<ProfitLossRow[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ data: txRows }, { data: expRows }] = await Promise.all([
        supabaseClient
          .from("transactions")
          .select("created_at, net_amount")
          .gte("created_at", `${startDate}T00:00:00`)
          .lte("created_at", `${endDate}T23:59:59`),
        supabaseClient
          .from("expenses")
          .select("expense_date, amount")
          .gte("expense_date", startDate)
          .lte("expense_date", endDate),
      ])

      const byPeriod = new Map<string, { revenue: number; expenses: number }>()
      ;(txRows ?? []).forEach((row) => {
        const period = row.created_at.slice(0, 7)
        const current = byPeriod.get(period) ?? { revenue: 0, expenses: 0 }
        current.revenue += Number(row.net_amount ?? 0)
        byPeriod.set(period, current)
      })
      ;(expRows ?? []).forEach((row) => {
        const period = row.expense_date.slice(0, 7)
        const current = byPeriod.get(period) ?? { revenue: 0, expenses: 0 }
        current.expenses += Number(row.amount ?? 0)
        byPeriod.set(period, current)
      })

      const mapped: ProfitLossRow[] = Array.from(byPeriod.entries())
        .map(([period, value]) => ({
          period,
          revenue: value.revenue,
          expenses: value.expenses,
          profit: value.revenue - value.expenses,
        }))
        .sort((a, b) => b.period.localeCompare(a.period))

      if (!cancelled) setRows(mapped)
    })()
    return () => {
      cancelled = true
    }
  }, [endDate, startDate])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900">Profit & Loss Report</h3>
        <ExportButton
          filename="profit-loss-report.csv"
          headers={["Period", "Revenue", "Expenses", "Profit"]}
          rows={rows.map((row) => [
            row.period,
            row.revenue,
            row.expenses,
            row.profit,
          ])}
        />
      </div>

      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <ProfitLossTable rows={rows} />
    </div>
  )
}
