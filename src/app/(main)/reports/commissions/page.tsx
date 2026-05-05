"use client"

import { useMemo, useState } from "react"
import CommissionReportTable from "@/components/reports/CommissionReportTable"
import ExportButton from "@/components/reports/ExportButton"
import ReportFilters from "@/components/reports/ReportFilters"
import { mockCommissionReport } from "@/lib/mock/reports"
import { formatCurrency } from "@/lib/utils"

export default function CommissionsReportPage() {
  const [startDate, setStartDate] = useState("2026-05-01")
  const [endDate, setEndDate] = useState("2026-05-31")
  const [staffFilter, setStaffFilter] = useState("All")

  const staffOptions = useMemo(
    () => Array.from(new Set(mockCommissionReport.map((row) => row.staffName))),
    [],
  )

  const rows = useMemo(
    () =>
      mockCommissionReport.filter(
        (row) => staffFilter === "All" || row.staffName === staffFilter,
      ),
    [staffFilter],
  )

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + row.commissionAmount, 0),
    [rows],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900">Commission Report</h3>
        <ExportButton
          filename="commission-report.csv"
          headers={["Date", "Staff", "Transaction", "Service", "Commission"]}
          rows={rows.map((row) => [
            row.date,
            row.staffName,
            row.transactionId,
            row.serviceName,
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
          className="rounded border border-gray-300 px-3 py-2"
          aria-label="Filter report by staff"
          title="Staff filter"
        >
          <option value="All">All Staff</option>
          {staffOptions.map((staff) => (
            <option key={staff} value={staff}>
              {staff}
            </option>
          ))}
        </select>
        <div className="rounded border border-gray-200 bg-white px-3 py-2">
          <p className="text-xs text-gray-500">Total Commission</p>
          <p className="font-semibold text-gray-900">{formatCurrency(total)}</p>
        </div>
      </div>

      <CommissionReportTable rows={rows} />
    </div>
  )
}
