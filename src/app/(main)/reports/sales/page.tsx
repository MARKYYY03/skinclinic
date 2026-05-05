"use client"

import { useMemo, useState } from "react"
import ExportButton from "@/components/reports/ExportButton"
import ReportFilters from "@/components/reports/ReportFilters"
import SalesReportTable from "@/components/reports/SalesReportTable"
import {
  mockSalesReportDaily,
  mockSalesReportMonthly,
  mockSalesReportWeekly,
} from "@/lib/mock/reports"

export default function SalesReportPage() {
  const [startDate, setStartDate] = useState("2026-05-01")
  const [endDate, setEndDate] = useState("2026-05-31")
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")

  const rows = useMemo(() => {
    if (period === "weekly") return mockSalesReportWeekly
    if (period === "monthly") return mockSalesReportMonthly
    return mockSalesReportDaily
  }, [period])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900">Sales Report</h3>
        <ExportButton
          filename={`sales-report-${period}.csv`}
          headers={["Period", "Total", "Cash", "GCash", "Maya", "Card", "Bank Transfer"]}
          rows={rows.map((row) => [
            row.period,
            row.totalSales,
            row.cash,
            row.gcash,
            row.maya,
            row.card,
            row.bankTransfer,
          ])}
        />
      </div>

      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <div className="rounded-lg bg-white p-4 shadow">
        <label className="text-sm text-gray-700">
          View mode
          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value as "daily" | "weekly" | "monthly")
            }
            className="ml-2 rounded border border-gray-300 px-2 py-1"
            aria-label="Select sales report period"
            title="Sales report period"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
      </div>

      <SalesReportTable rows={rows} />
    </div>
  )
}
