"use client"

import { useState } from "react"
import ExportButton from "@/components/reports/ExportButton"
import ProfitLossTable from "@/components/reports/ProfitLossTable"
import ReportFilters from "@/components/reports/ReportFilters"
import { mockProfitLossReport } from "@/lib/mock/reports"

export default function ProfitLossReportPage() {
  const [startDate, setStartDate] = useState("2026-04-01")
  const [endDate, setEndDate] = useState("2026-05-31")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900">Profit & Loss Report</h3>
        <ExportButton
          filename="profit-loss-report.csv"
          headers={["Period", "Revenue", "Expenses", "Profit"]}
          rows={mockProfitLossReport.map((row) => [
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

      <ProfitLossTable rows={mockProfitLossReport} />
    </div>
  )
}
