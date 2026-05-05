import { formatCurrency, formatDate } from "@/lib/utils"
import { CommissionSplitEntry } from "@/lib/mock/phase6"

interface CommissionTableProps {
  entries: CommissionSplitEntry[]
}

export default function CommissionTable({ entries }: CommissionTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Transaction
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Service
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Pool
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Split Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(entry.date)}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{entry.transactionId}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{entry.serviceName}</td>
              <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                {formatCurrency(entry.poolAmount)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {entry.staffShares.map((share) => (
                  <div key={`${entry.id}-${share.staffId}`}>
                    {share.staffName}: {formatCurrency(share.amount)}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
