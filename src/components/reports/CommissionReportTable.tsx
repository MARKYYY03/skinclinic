import { formatCurrency } from "@/lib/utils"
import { CommissionReportRow } from "@/lib/mock/reports"

interface CommissionReportTableProps {
  rows: CommissionReportRow[]
}

export default function CommissionReportTable({ rows }: CommissionReportTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Date</th>
            <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Staff</th>
            <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Transaction</th>
            <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">Service</th>
            <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">Commission</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, index) => (
            <tr key={`${row.transactionId}-${row.staffName}-${index}`}>
              <td className="px-3 py-2 text-sm text-gray-700">{row.date}</td>
              <td className="px-3 py-2 text-sm text-gray-700">{row.staffName}</td>
              <td className="px-3 py-2 text-sm text-gray-700">{row.transactionId}</td>
              <td className="px-3 py-2 text-sm text-gray-700">{row.serviceName}</td>
              <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                {formatCurrency(row.commissionAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
