"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import DataPaginator from "@/components/ui/DataPaginator"

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
  const [summaryPage, setSummaryPage] = useState(1)
  const [detailPage, setDetailPage] = useState(1)
  const [pageSize] = useState(10)

  const summaryTotalPages = Math.max(1, Math.ceil(summaryRows.length / pageSize))
  const detailTotalPages = Math.max(1, Math.ceil(detailRows.length / pageSize))

  const paginatedSummaryRows = summaryRows.slice(
    (summaryPage - 1) * pageSize,
    summaryPage * pageSize,
  )
  const paginatedDetailRows = detailRows.slice(
    (detailPage - 1) * pageSize,
    detailPage * pageSize,
  )
  return (
    <div className="space-y-8">
      <div className="space-y-0 rounded-xl border border-[#dfd8cf] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-b-none">
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
            {paginatedSummaryRows.map((row) => (
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
        <DataPaginator
          currentPage={summaryPage}
          totalPages={summaryTotalPages}
          pageSize={pageSize}
          totalItems={summaryRows.length}
          onPageChange={setSummaryPage}
          onPageSizeChange={() => setSummaryPage(1)}
        />
      </div>

      <div className="space-y-0 rounded-xl border border-[#dfd8cf] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-b-none">
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
            {paginatedDetailRows.map((row, index) => (
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
      <DataPaginator
        currentPage={detailPage}
        totalPages={detailTotalPages}
        pageSize={pageSize}
        totalItems={detailRows.length}
        onPageChange={setDetailPage}
        onPageSizeChange={() => setDetailPage(1)}
      />
      </div>
    </div>
  )
}
