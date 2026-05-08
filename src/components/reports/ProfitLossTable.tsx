"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { ProfitLossRow } from "@/types/reports"
import DataPaginator from "@/components/ui/DataPaginator"

interface ProfitLossTableProps {
  rows: ProfitLossRow[]
}

export default function ProfitLossTable({ rows }: ProfitLossTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="space-y-0 rounded-lg bg-white shadow overflow-hidden">
      <div className="overflow-x-auto rounded-b-none">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Period</th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Revenue</th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Expenses</th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedRows.map((row) => (
            <tr key={row.period}>
              <td className="px-3 py-2 text-sm text-gray-700">{row.period}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(row.revenue)}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(row.expenses)}</td>
              <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">{formatCurrency(row.profit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <DataPaginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={rows.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
