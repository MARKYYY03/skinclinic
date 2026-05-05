import { formatCurrency, formatDate } from "@/lib/utils"
import { Transaction } from "@/types/transaction"

interface ReceiptViewProps {
  transaction: Transaction
}

export default function ReceiptView({ transaction }: ReceiptViewProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Transaction Receipt</h2>
        <p className="text-sm text-gray-600">Reference: {transaction.id}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <p>
          <span className="font-medium text-gray-700">Client:</span> {transaction.clientName}
        </p>
        <p>
          <span className="font-medium text-gray-700">Cashier:</span> {transaction.createdBy}
        </p>
        <p>
          <span className="font-medium text-gray-700">Date:</span>{" "}
          {formatDate(transaction.createdAt)}
        </p>
        <p>
          <span className="font-medium text-gray-700">Status:</span> {transaction.status}
        </p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Item
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Type
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Qty
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Unit
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Discount
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transaction.items.map((item, index) => (
              <tr key={`${item.referenceId}-${index}`}>
                <td className="px-3 py-2 text-sm text-gray-900">{item.name}</td>
                <td className="px-3 py-2 text-sm capitalize text-gray-700">{item.type}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-700">{item.quantity}</td>
                <td className="px-3 py-2 text-right text-sm text-gray-700">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-3 py-2 text-right text-sm text-gray-700">
                  {formatCurrency(item.discount * item.quantity)}
                </td>
                <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 rounded border border-gray-200 p-3">
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Payments</h3>
        <div className="space-y-1 text-sm text-gray-700">
          {transaction.payments.map((payment, index) => (
            <div key={`${payment.method}-${index}`} className="flex justify-between">
              <span>{payment.method}</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-auto max-w-sm space-y-1 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Gross</span>
          <span>{formatCurrency(transaction.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Discount</span>
          <span>-{formatCurrency(transaction.discountTotal)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold text-gray-900">
          <span>Net</span>
          <span>{formatCurrency(transaction.netAmount)}</span>
        </div>
      </div>
    </div>
  )
}
