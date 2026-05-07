import Link from "next/link"

import { formatCurrency, formatDateTime } from "@/lib/utils"

interface RecentTransactionsProps {
  rows: Array<{
    id: string
    clientName: string
    netAmount: number
    status: string
    createdAt: string
  }>
}

export default function RecentTransactions({ rows }: RecentTransactionsProps) {
  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#1f2918]">Recent Transactions</h3>
      <div className="mt-3 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-[#6a6358]">No recent transactions.</p>
        ) : (
          rows.map((row) => (
            <Link
              key={row.id}
              href={`/transactions/${row.id}`}
              className="block rounded-lg border border-[#e5ded4] px-3 py-2 hover:bg-[#F5F0E8]/40"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#1f2918]">{row.clientName}</p>
                <p className="text-sm font-semibold text-[#1f2918]">
                  {formatCurrency(row.netAmount)}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-[#6a6358]">
                {row.status} • {formatDateTime(row.createdAt)}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
