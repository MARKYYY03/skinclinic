import { InventoryReportRow } from "@/lib/mock/reports"

interface InventoryReportTableProps {
  rows: InventoryReportRow[]
}

export default function InventoryReportTable({ rows }: InventoryReportTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
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
          {rows.map((row) => {
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
  )
}
