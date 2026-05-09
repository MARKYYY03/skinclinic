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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {paginatedExpenses.map((expense) => (
            <tr key={expense.id}>
              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(expense.date)}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{expense.category}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{expense.description}</td>
              <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                {formatCurrency(expense.amount)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{expense.recordedBy}</td>
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
    </div>
  )
}
