"use client"

import { useEffect, useMemo, useState } from "react"
import ExportButton from "@/components/reports/ExportButton"
import ReportFilters from "@/components/reports/ReportFilters"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { formatCurrency } from "@/lib/utils"
import type { ExpenseReportRow } from "@/types/reports"

export default function ExpensesReportPage() {
  const [startDate, setStartDate] = useState("2026-05-01")
  const [endDate, setEndDate] = useState("2026-05-31")
  const [rows, setRows] = useState<ExpenseReportRow[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabaseClient
        .from("expenses")
        .select("category, amount, expense_date")
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)

      const grouped = new Map<string, number>()
      ;(data ?? []).forEach((row) => {
        grouped.set(row.category, (grouped.get(row.category) ?? 0) + Number(row.amount ?? 0))
      })
      const mapped = Array.from(grouped.entries()).map(([category, amount]) => ({ category, amount }))
      if (!cancelled) setRows(mapped)
    })()
    return () => {
      cancelled = true
    }
  }, [endDate, startDate])

  const total = useMemo(
    () => rows.reduce((sum, item) => sum + item.amount, 0),
    [rows],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900">Expense Report</h3>
        <ExportButton
          filename="expense-report.csv"
          headers={["Category", "Amount"]}
          rows={rows.map((row) => [row.category, row.amount])}
        />
      </div>

      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <div className="rounded-lg bg-white p-4 shadow">
        <p className="text-sm text-gray-600">Total Expenses</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Category</th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.category}>
                <td className="px-3 py-2 text-sm text-gray-700">{row.category}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
