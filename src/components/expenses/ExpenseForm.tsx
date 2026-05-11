"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EXPENSE_CATEGORIES } from "@/lib/constants"
import { Expense } from "@/types/expense"

interface ExpenseFormProps {
  onSubmit?: (expense: Expense) => void
}

export default function ExpenseForm({
  onSubmit,
}: ExpenseFormProps) {
  const router = useRouter()
  const [category, setCategory] = useState<(typeof EXPENSE_CATEGORIES)[number]>("Operations")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!description.trim() || amount <= 0) {
      setError("Description and amount are required.")
      return
    }

    const expensePayload: Expense = {
      id: `exp-${Date.now()}`,
      category,
      description: description.trim(),
      amount,
      date,
      recordedBy: "Admin User",
    }

    onSubmit?.(expensePayload)

    // If parent provided onSubmit (modal case), it is responsible for closing + refresh.
    if (!onSubmit) router.push("/expenses")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-5 shadow">
      <h3 className="text-lg font-semibold text-gray-900">Log Expense</h3>

      <label className="block text-sm">
        <span className="mb-1 block text-gray-700">Category</span>
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as (typeof EXPENSE_CATEGORIES)[number])
          }
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Select expense category"
          title="Expense category selector"
        >
          {EXPENSE_CATEGORIES.map((item) => (
            <option key={item} value={item} className="bg-white text-black">
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-gray-700">Description</span>
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Clinic utilities"
        />
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Amount</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/expenses")}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Save Expense
        </button>
      </div>
    </form>
  )
}
