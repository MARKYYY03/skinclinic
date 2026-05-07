import { formatCurrency } from "@/lib/utils"
import { ProfitLossRow } from "@/types/reports"

interface ProfitLossTableProps {
  rows: ProfitLossRow[]
}

export default function ProfitLossTable({ rows }: ProfitLossTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
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
          {rows.map((row) => (
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
  )
}
