"use client"

import { useMemo, useState } from "react"
import ExportButton from "@/components/reports/ExportButton"
import ReportFilters from "@/components/reports/ReportFilters"
import { mockExpenseReport } from "@/lib/mock/reports"
import { formatCurrency } from "@/lib/utils"

export default function ExpensesReportPage() {
  const [startDate, setStartDate] = useState("2026-05-01")
  const [endDate, setEndDate] = useState("2026-05-31")

  const total = useMemo(
    () => mockExpenseReport.reduce((sum, item) => sum + item.amount, 0),
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900">Expense Report</h3>
        <ExportButton
          filename="expense-report.csv"
          headers={["Category", "Amount"]}
          rows={mockExpenseReport.map((row) => [row.category, row.amount])}
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
            {mockExpenseReport.map((row) => (
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
