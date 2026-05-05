"use client"

import { useState } from "react"
import { TransactionPayment, PaymentMethod } from "@/types/transaction"

interface PaymentSplitFormProps {
  payments: TransactionPayment[]
  onChange: (payments: TransactionPayment[]) => void
  totalAmount: number
}

const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "GCash", "Maya", "Card", "BankTransfer", "HomeCredit"]

export default function PaymentSplitForm({
  payments,
  onChange,
  totalAmount,
}: PaymentSplitFormProps) {
  const [error, setError] = useState<string>("")

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = totalAmount - totalPaid

  const handleAddPayment = () => {
    const newPayment: TransactionPayment = {
      method: "Cash",
      amount: 0,
    }
    onChange([...payments, newPayment])
  }

  const handleUpdatePayment = (index: number, method: PaymentMethod, amount: number) => {
    const updatedPayments = [...payments]
    updatedPayments[index] = { method, amount }
    
    const newTotal = updatedPayments.reduce((sum, p) => sum + p.amount, 0)
    if (newTotal > totalAmount) {
      setError(`Payment cannot exceed total (₱${totalAmount.toLocaleString()})`)
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
        <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
        <button
          onClick={handleAddPayment}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          + Add Payment
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        {payments.map((payment, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={payment.method}
              onChange={(e) =>
                handleUpdatePayment(index, e.target.value as PaymentMethod, payment.amount)
              }
              className="rounded border border-gray-300 px-3 py-2 text-sm"
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
                handleUpdatePayment(index, payment.method, parseFloat(e.target.value) || 0)
              }
              placeholder="Amount"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            />

            <span className="text-sm font-medium text-gray-700 w-24 text-right">
              ₱{payment.amount.toLocaleString()}
            </span>

            <button
              onClick={() => handleRemovePayment(index)}
              className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      <div className="rounded-lg bg-gray-50 p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Total Amount:</span>
          <span className="font-medium">₱{totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Paid:</span>
          <span className="font-medium text-green-600">₱{totalPaid.toLocaleString()}</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span>Remaining:</span>
          <span className={`font-medium ${remaining === 0 ? "text-green-600" : "text-orange-600"}`}>
            ₱{remaining.toLocaleString()}
          </span>
        </div>
      </div>

      {remaining === 0 && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-2">
          <p className="text-sm text-green-800">✓ Payment balanced</p>
        </div>
      )}
    </div>
  )
}
