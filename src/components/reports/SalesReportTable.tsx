import { formatCurrency } from "@/lib/utils"
import { SalesReportRow } from "@/lib/mock/reports"

interface SalesReportTableProps {
  rows: SalesReportRow[]
}

export default function SalesReportTable({ rows }: SalesReportTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Period</th>
            <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Total</th>
            <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Cash</th>
            <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">GCash</th>
            <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Maya</th>
            <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Card</th>
            <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Bank Transfer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row) => (
            <tr key={row.period}>
              <td className="px-3 py-2 text-sm text-gray-700">{row.period}</td>
              <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">{formatCurrency(row.totalSales)}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(row.cash)}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(row.gcash)}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(row.maya)}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(row.card)}</td>
              <td className="px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(row.bankTransfer)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
