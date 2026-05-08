"use client"

import Link from "next/link"
import { useState } from "react"

import { formatCurrency, formatDate } from "@/lib/utils"
import DataPaginator from "@/components/ui/DataPaginator"

interface CommissionTableProps {
  rows: Array<{
    id: string
    date: string
    clientName: string
    serviceName: string
    grossAmount: number
    rate: number
    poolShare: number
    commissionAmount: number
    staffName: string
    transactionId: string
  }>
}

export default function CommissionTable({ rows }: CommissionTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="space-y-0 rounded-xl border border-[#dfd8cf] bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto rounded-b-none">
        <table className="min-w-full divide-y divide-[#e5ded4]">
        <thead className="bg-[#F5F0E8]/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Client
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Service
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Gross
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Rate
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Pool Share
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Commission
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Staff
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Transaction
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5ded4] bg-white">
          {paginatedRows.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-sm text-[#6a6358]">
                {rows.length === 0 ? "No commission entries in this range." : "No entries on this page."}
              </td>
            </tr>
          ) : null}
          {paginatedRows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 text-sm text-[#314031]">{formatDate(row.date)}</td>
              <td className="px-4 py-3 text-sm text-[#314031]">{row.clientName}</td>
              <td className="px-4 py-3 text-sm text-[#314031]">{row.serviceName}</td>
              <td className="px-4 py-3 text-right text-sm text-[#314031]">
                {formatCurrency(row.grossAmount)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-[#314031]">{row.rate}%</td>
              <td className="px-4 py-3 text-right text-sm text-[#314031]">
                {row.poolShare.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-[#1f2918]">
                {formatCurrency(row.commissionAmount)}
              </td>
              <td className="px-4 py-3 text-sm text-[#314031]">{row.staffName}</td>
              <td className="px-4 py-3 text-right text-sm">
                <Link
                  href={`/transactions/${row.transactionId}`}
                  className="font-semibold text-[#6B7A3E] hover:text-[#5a6734]"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <DataPaginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={rows.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
