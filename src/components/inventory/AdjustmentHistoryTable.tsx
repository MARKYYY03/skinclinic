"use client"

import { useState } from "react"
import { InventoryLog } from "@/types/inventory"
import { formatDateTime } from "@/lib/utils"
import DataPaginator from "@/components/ui/DataPaginator"

interface AdjustmentHistoryTableProps {
  logs: (InventoryLog & { staffName: string })[]
}

const TYPE_BADGES = {
  StockIn: { color: "bg-green-100 text-green-800", label: "📦 Stock In" },
  StockOut: { color: "bg-blue-100 text-blue-800", label: "📤 Stock Out" },
  Spoilage: { color: "bg-red-100 text-red-800", label: "🗑️ Spoilage" },
  Damaged: { color: "bg-orange-100 text-orange-800", label: "⚠️ Damaged" },
}

export default function AdjustmentHistoryTable({ logs }: AdjustmentHistoryTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedLogs = logs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No adjustment logs yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-0 rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto rounded-b-none">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Date & Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Type
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Stock Before → After
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Reason / Notes
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Recorded By
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paginatedLogs.map((log) => {
            const badge = TYPE_BADGES[log.type]
            const quantitySign = log.type === "StockIn" ? "+" : "−"
            const quantityColor = log.type === "StockIn" ? "text-green-600" : "text-red-600"

            return (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDateTime(log.date)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right text-sm font-semibold ${quantityColor}`}>
                  {quantitySign}{log.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {log.stockBefore ?? "?"} → {log.stockAfter ?? "?"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {log.reason || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {log.staffName}
                </td>
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
        totalItems={logs.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
