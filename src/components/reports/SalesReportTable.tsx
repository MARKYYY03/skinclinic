"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import DataPaginator from "@/components/ui/DataPaginator"

interface SalesReportTableProps {
  paymentMethodRows: Array<{
    method: string
    transactionCount: number
    totalAmount: number
  }>
  dailyRows: Array<{
    date: string
    transactionCount: number
    gross: number
    discount: number
    net: number
  }>
}

export default function SalesReportTable({ paymentMethodRows, dailyRows }: SalesReportTableProps) {
  const [paymentPage, setPaymentPage] = useState(1)
  const [dailyPage, setDailyPage] = useState(1)
  const [pageSize] = useState(10)

  const paymentTotalPages = Math.max(1, Math.ceil(paymentMethodRows.length / pageSize))
  const dailyTotalPages = Math.max(1, Math.ceil(dailyRows.length / pageSize))

  const paginatedPaymentRows = paymentMethodRows.slice(
    (paymentPage - 1) * pageSize,
    paymentPage * pageSize,
  )
  const paginatedDailyRows = dailyRows.slice(
    (dailyPage - 1) * pageSize,
    dailyPage * pageSize,
  )
  return (
    <div className="space-y-8">
      <div className="space-y-0 rounded-xl border border-[#dfd8cf] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-b-none">
          <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/80">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Payment Method
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Transactions
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Total Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4] bg-white">
            {paginatedPaymentRows.map((row) => (
              <tr key={row.method}>
                <td className="px-3 py-2 text-sm text-[#314031]">{row.method}</td>
                <td className="px-3 py-2 text-right text-sm text-[#314031]">
                  {row.transactionCount}
                </td>
                <td className="px-3 py-2 text-right text-sm font-medium text-[#1f2918]">
                  {formatCurrency(row.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <DataPaginator
          currentPage={paymentPage}
          totalPages={paymentTotalPages}
          pageSize={pageSize}
          totalItems={paymentMethodRows.length}
          onPageChange={setPaymentPage}
          onPageSizeChange={() => setPaymentPage(1)}
          showSummary={true}
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
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Transactions
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Gross
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Discount
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Net
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4] bg-white">
            {paginatedDailyRows.map((row) => (
              <tr key={row.date}>
                <td className="px-3 py-2 text-sm text-[#314031]">{row.date}</td>
                <td className="px-3 py-2 text-right text-sm text-[#314031]">
                  {row.transactionCount}
                </td>
                <td className="px-3 py-2 text-right text-sm text-[#314031]">
                  {formatCurrency(row.gross)}
                </td>
                <td className="px-3 py-2 text-right text-sm text-[#314031]">
                  {formatCurrency(row.discount)}
                </td>
                <td className="px-3 py-2 text-right text-sm font-medium text-[#1f2918]">
                  {formatCurrency(row.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <DataPaginator
          currentPage={dailyPage}
          totalPages={dailyTotalPages}
          pageSize={pageSize}
          totalItems={dailyRows.length}
          onPageChange={setDailyPage}
          onPageSizeChange={() => setDailyPage(1)}
          showSummary={true}
        />
      </div>
    </div>
  )
}
