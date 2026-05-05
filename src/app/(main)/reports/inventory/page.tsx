"use client"

import { useMemo, useState } from "react"
import ExportButton from "@/components/reports/ExportButton"
import InventoryReportTable from "@/components/reports/InventoryReportTable"
import ReportFilters from "@/components/reports/ReportFilters"
import { mockInventoryReport } from "@/lib/mock/reports"

export default function InventoryReportPage() {
  const [startDate, setStartDate] = useState("2026-05-01")
  const [endDate, setEndDate] = useState("2026-05-31")

  const spoilageTotal = useMemo(
    () => mockInventoryReport.reduce((sum, row) => sum + row.spoilageQuantity, 0),
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900">Inventory Report</h3>
        <ExportButton
          filename="inventory-report.csv"
          headers={["Product", "Stock", "Threshold", "Spoilage"]}
          rows={mockInventoryReport.map((row) => [
            row.productName,
            row.stockQuantity,
            row.lowStockThreshold,
            row.spoilageQuantity,
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
        <p className="text-sm text-gray-600">Total Spoilage Quantity</p>
        <p className="text-2xl font-bold text-gray-900">{spoilageTotal}</p>
      </div>

      <InventoryReportTable rows={mockInventoryReport} />
    </div>
  )
}
