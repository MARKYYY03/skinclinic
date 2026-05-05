import { formatCurrency, formatDate } from "@/lib/utils"
import { Expense } from "@/types/expense"

interface ExpenseTableProps {
  expenses: Expense[]
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
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
          {expenses.map((expense) => (
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
  )
}
