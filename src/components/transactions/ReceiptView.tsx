"use client"

import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"

interface ReceiptViewProps {
  transaction: Transaction
  canVoid?: boolean
  voiding?: boolean
  onVoid?: () => void
}

export default function ReceiptView({
  transaction,
  canVoid = false,
  voiding = false,
  onVoid,
}: ReceiptViewProps) {
  const paymentTypes = Array.from(new Set(transaction.payments.map((payment) => payment.method)))
  const paymentTypeLabel =
    paymentTypes.length > 0
      ? paymentTypes.join(", ")
      : transaction.amountPaid > 0
        ? "Recorded payment (type not specified)"
        : "—"

  const staffLine =
    transaction.staffNames?.filter(Boolean).join(", ") ||
    (transaction.staffIds?.length
      ? `${transaction.staffIds.length} staff`
      : "—")

  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white p-6 shadow-sm print:border-0 print:shadow-none">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e5ded4] pb-4 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xl font-bold text-[#6B7A3E]">Relevare</p>
            <p className="text-sm text-[#6a6358]">Clinic receipt</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-[#6B7A3E] px-3 py-1.5 text-sm font-semibold text-[#6B7A3E] hover:bg-[#F5F0E8]"
            >
              Print receipt
            </button>
            {canVoid && transaction.status !== "Voided" ? (
              <button
                type="button"
                disabled={voiding}
                onClick={onVoid}
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
              >
                {voiding ? "Voiding…" : "Void transaction"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mb-2 hidden print:block">
        <p className="text-xl font-bold text-[#6B7A3E]">Relevare</p>
        <p className="text-sm text-gray-600">Transaction receipt</p>
      </div>

      <div className="mb-6 border-b border-[#e5ded4] pb-4">
        <h2 className="text-2xl font-bold text-[#1f2918]">Receipt</h2>
        <p className="text-sm text-[#6a6358]">ID: {transaction.id}</p>
        <p className="text-sm text-[#6a6358]">{formatDateTime(transaction.createdAt)}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <p>
          <span className="font-medium text-[#314031]">Client:</span>{" "}
          <span className="text-[#1f2918]">{transaction.clientName}</span>
        </p>
        <p>
          <span className="font-medium text-[#314031]">Cashier:</span>{" "}
          <span className="text-[#1f2918]">{transaction.createdBy}</span>
        </p>
        <p>
          <span className="font-medium text-[#314031]">Staff:</span>{" "}
          <span className="text-[#1f2918]">{staffLine}</span>
        </p>
        <p>
          <span className="font-medium text-[#314031]">Status:</span>{" "}
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
              transaction.status === "Completed"
                ? "bg-emerald-100 text-emerald-900"
                : transaction.status === "Partial"
                  ? "bg-amber-100 text-amber-950"
                  : "bg-red-100 text-red-900"
            }`}
          >
            {transaction.status}
          </span>
        </p>
        <p>
          <span className="font-medium text-[#314031]">Payment type(s):</span>{" "}
          <span className="text-[#1f2918]">{paymentTypeLabel}</span>
        </p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/80">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-[#5c564c]">
                Item
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-[#5c564c]">
                Qty
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-[#5c564c]">
                Unit
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-[#5c564c]">
                Discount
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-[#5c564c]">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4]">
            {transaction.items.map((item, index) => {
              const pkgLabel =
                item.unitPrice === 0 && item.type === "service"
                  ? "Package session (₱0)"
                  : null
              return (
                <tr key={`${item.referenceId}-${index}`}>
                  <td className="px-3 py-2 text-sm text-[#1f2918]">
                    {item.name}
                    {pkgLabel ? (
                      <span className="mt-0.5 block text-xs text-[#6a6358]">{pkgLabel}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-[#314031]">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-[#314031]">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-3 py-2 text-right text-sm text-[#314031]">
                    {formatCurrency(item.discount * item.quantity)}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium text-[#1f2918]">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-6 rounded-lg border border-[#e5ded4] p-3">
        <h3 className="mb-2 text-sm font-semibold text-[#1f2918]">Payments</h3>
        <div className="space-y-1 text-sm text-[#314031]">
          {transaction.payments.length ? (
            transaction.payments.map((payment, index) => (
              <div key={`${payment.method}-${index}`} className="flex justify-between">
                <span>{payment.method}</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))
          ) : transaction.amountPaid > 0 ? (
            <>
              <div className="flex justify-between">
                <span>Recorded payment</span>
                <span>{formatCurrency(transaction.amountPaid)}</span>
              </div>
              <p className="text-xs text-[#6a6358]">
                This transaction has no split payment rows in `transaction_payments`.
              </p>
            </>
          ) : (
            <p className="text-[#6a6358]">No payment rows</p>
          )}
        </div>
      </div>

      <div className="ml-auto max-w-sm space-y-1 text-sm">
        <div className="flex justify-between text-[#314031]">
          <span>Gross</span>
          <span>{formatCurrency(transaction.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-[#314031]">
          <span>Discount</span>
          <span>−{formatCurrency(transaction.discountTotal)}</span>
        </div>
        <div className="flex justify-between border-t border-[#e5ded4] pt-2 text-base font-semibold text-[#1f2918]">
          <span>Net</span>
          <span>{formatCurrency(transaction.netAmount)}</span>
        </div>
        <div className="flex justify-between text-[#314031]">
          <span>Paid</span>
          <span>{formatCurrency(transaction.amountPaid)}</span>
        </div>
        <div className="flex justify-between font-semibold text-[#1f2918]">
          <span>Balance due</span>
          <span className={transaction.balanceDue > 0 ? "text-red-700" : ""}>
            {formatCurrency(transaction.balanceDue)}
          </span>
        </div>
      </div>

      {transaction.notes ? (
        <p className="mt-6 text-sm text-[#6a6358]">
          <span className="font-medium text-[#314031]">Notes:</span> {transaction.notes}
        </p>
      ) : null}
    </div>
  )
}
