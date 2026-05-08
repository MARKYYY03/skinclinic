"use client"

import { useState } from "react"
import { InventoryReportRow } from "@/types/reports"
import DataPaginator from "@/components/ui/DataPaginator"

interface InventoryReportTableProps {
  rows: InventoryReportRow[]
}

export default function InventoryReportTable({ rows }: InventoryReportTableProps) {
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
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Product</th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Stock</th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Threshold</th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Spoilage</th>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedRows.map((row) => {
            const status =
              row.stockQuantity <= 0
                ? "Out of stock"
                : row.stockQuantity <= row.lowStockThreshold
                  ? "Low stock"
                  : "Healthy"
            return (
              <tr key={row.productName}>
                <td className="px-3 py-2 text-sm text-gray-700">{row.productName}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-700">{row.stockQuantity}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-700">{row.lowStockThreshold}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-700">{row.spoilageQuantity}</td>
                <td className="px-3 py-2 text-sm font-medium text-gray-900">{status}</td>
              </tr>
            )
          })}
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
