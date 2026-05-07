"use client"

import Link from "next/link"
import { useMemo } from "react"

import type { Transaction } from "@/types/transaction"
import { formatCurrency, formatDateTime } from "@/lib/utils"

interface TransactionTableProps {
  transactions: Transaction[]
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const totals = useMemo(() => {
    const net = transactions.reduce((s, t) => s + t.netAmount, 0)
    const paid = transactions.reduce((s, t) => s + t.amountPaid, 0)
    const bal = transactions.reduce((s, t) => s + t.balanceDue, 0)
    return { net, paid, bal }
  }, [transactions])

  function statusBadge(status: string) {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-900"
      case "Partial":
        return "bg-amber-100 text-amber-950"
      case "Voided":
        return "bg-red-100 text-red-900 line-through"
      default:
        return "bg-[#e8e3dc] text-[#314031]"
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Date &amp; time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Client
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Net
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Paid
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Payment Types
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Cashier
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4] bg-white">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-sm text-[#6a6358]"
                >
                  No transactions in this range
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-[#F5F0E8]/40 ${t.status === "Voided" ? "opacity-80" : ""}`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-[#314031]">
                    {formatDateTime(t.createdAt)}
                  </td>
                  <td className="max-w-[12rem] truncate px-4 py-3 text-sm font-medium text-[#1f2918]">
                    {t.clientName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-[#314031]">
                    {formatCurrency(t.netAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-[#314031]">
                    {formatCurrency(t.amountPaid)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${
                      t.balanceDue > 0 ? "text-red-700" : "text-[#314031]"
                    }`}
                  >
                    {formatCurrency(t.balanceDue)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(t.status)}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="max-w-[12rem] truncate px-4 py-3 text-sm text-[#314031]">
                    {t.payments.length
                      ? Array.from(new Set(t.payments.map((p) => p.method))).join(", ")
                      : t.amountPaid > 0
                        ? "Recorded (no split rows)"
                        : "—"}
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-3 text-sm text-[#6a6358]">
                    {t.createdBy}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      href={`/transactions/${t.id}`}
                      className="font-semibold text-[#6B7A3E] hover:text-[#5a6734]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {transactions.length > 0 ? (
            <tfoot className="border-t-2 border-[#6B7A3E]/40 bg-[#F5F0E8]/90">
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-3 text-sm font-semibold text-[#1f2918]"
                >
                  Totals ({transactions.length})
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-[#1f2918]">
                  {formatCurrency(totals.net)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-[#1f2918]">
                  {formatCurrency(totals.paid)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-red-800">
                  {formatCurrency(totals.bal)}
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </div>
  )
}
