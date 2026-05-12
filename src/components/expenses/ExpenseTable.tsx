"use client"

import { useState } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Expense } from "@/types/expense"
import DataPaginator from "@/components/ui/DataPaginator"

interface ExpenseTableProps {
  expenses: Expense[]
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewExpense, setViewExpense] = useState<Expense | null>(null)

  const totalPages = Math.max(1, Math.ceil(expenses.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedExpenses = expenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="space-y-0 rounded-lg bg-white shadow overflow-hidden">
      <div className="overflow-x-auto rounded-b-none">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Recorded By
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {expense.category}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {expense.description}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {expense.recordedBy}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="font-medium text-[#6B7A3E] hover:text-[#5a6734]"
                    onClick={() => setViewExpense(expense)}
                  >
                    View
                  </button>
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
        totalItems={expenses.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />

      {viewExpense ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg overflow-y-auto rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <h3 className="text-lg font-semibold text-[#1f2918]">Expense Details</h3>
              <button
                type="button"
                onClick={() => setViewExpense(null)}
                aria-label="Close modal"
                className="text-2xl leading-none text-[#6a6358] hover:text-[#1f2918]"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              {/* 2-column grid for smaller fields */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Date
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {viewExpense.date ? formatDate(viewExpense.date) : <em className="text-gray-400 italic">Not provided</em>}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Category
                  </div>
                  <div className="mt-2">
                    {viewExpense.category ? (
                      <span className="inline-flex items-center rounded-full bg-[#6B7A3E]/10 px-3 py-1 text-sm font-medium text-[#6B7A3E]">
                        {viewExpense.category}
                      </span>
                    ) : (
                      <em className="text-gray-400 italic">Not provided</em>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Amount
                  </div>
                  <div className="mt-1 text-xl font-bold text-[#6B7A3E]">
                    {typeof viewExpense.amount === "number" ? formatCurrency(viewExpense.amount) : <em className="text-gray-400 italic">Not provided</em>}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Recorded By
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {viewExpense.recordedBy ? viewExpense.recordedBy : <em className="text-gray-400 italic">Not provided</em>}
                  </div>
                </div>
              </div>

              {/* Full width fields */}
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Description
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {viewExpense.description ? viewExpense.description : <em className="text-gray-400 italic">Not provided</em>}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Vendor
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {(viewExpense as any).vendor ? (viewExpense as any).vendor : <em className="text-gray-400 italic">Not provided</em>}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Notes
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {(viewExpense as any).notes ? (viewExpense as any).notes : <em className="text-gray-400 italic">Not provided</em>}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewExpense(null)}
                className="rounded-lg border border-[#cfc6ba] px-6 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
