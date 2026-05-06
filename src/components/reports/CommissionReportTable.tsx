import { formatCurrency } from "@/lib/utils"

interface CommissionReportTableProps {
  summaryRows: Array<{
    staffName: string
    transactionCount: number
    totalCommissionEarned: number
  }>
  detailRows: Array<{
    date: string
    staffName: string
    transactionId: string
    serviceName: string
    grossAmount: number
    rate: number
    poolShare: number
    commissionAmount: number
  }>
}

export default function CommissionReportTable({
  summaryRows,
  detailRows,
}: CommissionReportTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/80">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Staff
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Transactions
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Total Commission
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4] bg-white">
            {summaryRows.map((row) => (
              <tr key={row.staffName}>
                <td className="px-3 py-2 text-sm text-[#314031]">{row.staffName}</td>
                <td className="px-3 py-2 text-right text-sm text-[#314031]">
                  {row.transactionCount}
                </td>
                <td className="px-3 py-2 text-right text-sm font-medium text-[#1f2918]">
                  {formatCurrency(row.totalCommissionEarned)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/80">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Staff
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Transaction
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Service
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Gross
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Rate
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Share
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Commission
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4] bg-white">
            {detailRows.map((row, index) => (
              <tr key={`${row.transactionId}-${row.staffName}-${index}`}>
                <td className="px-3 py-2 text-sm text-[#314031]">{row.date}</td>
                <td className="px-3 py-2 text-sm text-[#314031]">{row.staffName}</td>
                <td className="px-3 py-2 text-sm text-[#314031]">{row.transactionId}</td>
                <td className="px-3 py-2 text-sm text-[#314031]">{row.serviceName}</td>
                <td className="px-3 py-2 text-right text-sm text-[#314031]">
                  {formatCurrency(row.grossAmount)}
                </td>
                <td className="px-3 py-2 text-right text-sm text-[#314031]">{row.rate}%</td>
                <td className="px-3 py-2 text-right text-sm text-[#314031]">
                  {row.poolShare.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right text-sm font-medium text-[#1f2918]">
                  {formatCurrency(row.commissionAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
