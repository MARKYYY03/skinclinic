"use client"

import { useState } from "react"
import type { TransactionPayment, PaymentMethod } from "@/types/transaction"
import { formatCurrency } from "@/lib/utils"

interface PaymentSplitFormProps {
  payments: TransactionPayment[]
  onChange: (payments: TransactionPayment[]) => void
  netAmount: number
}

const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "GCash",
  "Maya",
  "Card",
  "BankTransfer",
  "HomeCredit",
]

export default function PaymentSplitForm({
  payments,
  onChange,
  netAmount,
}: PaymentSplitFormProps) {
  const [error, setError] = useState("")

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const balanceDue = Math.max(0, Math.round((netAmount - totalPaid) * 100) / 100)

  const handleAddPayment = () => {
    onChange([...payments, { method: "Cash", amount: 0 }])
    setError("")
  }

  const handleUpdatePayment = (index: number, method: PaymentMethod, amount: number) => {
    const updatedPayments = [...payments]
    updatedPayments[index] = { method, amount }
    const newTotal = updatedPayments.reduce((sum, p) => sum + p.amount, 0)
    if (newTotal > netAmount + 0.01) {
      setError(`Payments cannot exceed net amount (${formatCurrency(netAmount)}).`)
    } else {
      setError("")
    }
    onChange(updatedPayments)
  }

  const handleRemovePayment = (index: number) => {
    onChange(payments.filter((_, i) => i !== index))
    setError("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1f2918]">Payments</h3>
        <button
          type="button"
          onClick={handleAddPayment}
          className="rounded-lg bg-[#6B7A3E] px-3 py-1.5 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
        >
          Add payment
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      ) : null}

      <div className="space-y-2">
        {payments.map((payment, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <select
              value={payment.method}
              onChange={(e) =>
                handleUpdatePayment(
                  index,
                  e.target.value as PaymentMethod,
                  payment.amount,
                )
              }
              className="rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              step="0.01"
              value={payment.amount}
              onChange={(e) =>
                handleUpdatePayment(
                  index,
                  payment.method,
                  parseFloat(e.target.value) || 0,
                )
              }
              className="min-w-[8rem] flex-1 rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
              aria-label="Payment amount"
            />

            <span className="w-28 text-right text-sm font-medium text-[#314031]">
              {formatCurrency(payment.amount)}
            </span>

            <button
              type="button"
              onClick={() => handleRemovePayment(index)}
              className="rounded px-2 py-1 text-red-700 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-lg border border-[#dfd8cf] bg-[#F5F0E8]/60 p-3 text-sm">
        <div className="flex justify-between text-[#314031]">
          <span>Net amount</span>
          <span className="font-medium">{formatCurrency(netAmount)}</span>
        </div>
        <div className="flex justify-between text-[#314031]">
          <span>Total paid</span>
          <span className="font-medium text-emerald-800">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="flex justify-between border-t border-[#e5ded4] pt-2 font-semibold text-[#1f2918]">
          <span>Balance due</span>
          <span className={balanceDue > 0 ? "text-amber-800" : "text-emerald-800"}>
            {formatCurrency(balanceDue)}
          </span>
        </div>
      </div>

      {balanceDue > 0.009 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Transaction will be saved as <strong>Partial</strong> until the balance is settled.
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Transaction is <strong>fully paid</strong> (Completed).
        </div>
      )}
    </div>
  )
}
