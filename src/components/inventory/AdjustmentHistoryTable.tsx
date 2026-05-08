import { InventoryLog } from "@/types/inventory"
import { formatDateTime } from "@/lib/utils"

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
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No adjustment logs yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
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
          {logs.map((log) => {
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
  )
}
