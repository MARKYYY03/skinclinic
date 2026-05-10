"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import PageWrapper from "@/components/layout/PageWrapper"
import ExpenseTable from "@/components/expenses/ExpenseTable"
import { EXPENSE_CATEGORIES } from "@/lib/constants"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { Expense } from "@/types/expense"
import { formatCurrency } from "@/lib/utils"
import ExpenseForm from "@/components/expenses/ExpenseForm"

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [monthFilter, setMonthFilter] = useState("All")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: expenseRows } = await supabaseClient
        .from("expenses")
        .select("id, category, description, amount, expense_date, recorded_by")
        .order("expense_date", { ascending: false })
      const recorderIds = Array.from(
        new Set((expenseRows ?? []).map((row) => row.recorded_by).filter(Boolean)),
      )
      const { data: profiles } = recorderIds.length
        ? await supabaseClient.from("profiles").select("id, full_name").in("id", recorderIds as string[])
        : { data: [] as Array<{ id: string; full_name: string }> }
      const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]))

      if (!cancelled) {
        setExpenses(
          (expenseRows ?? []).map((row) => ({
            id: row.id,
            category: row.category,
            description: row.description,
            amount: Number(row.amount ?? 0),
            date: row.expense_date,
            recordedBy: row.recorded_by ? nameById.get(row.recorded_by) ?? "Unknown" : "System",
          })),
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const monthKey = expense.date.slice(0, 7)
        const matchCategory =
          categoryFilter === "All" || expense.category === categoryFilter
        const matchMonth = monthFilter === "All" || monthKey === monthFilter
        return matchCategory && matchMonth
      }),
    [categoryFilter, monthFilter, expenses],
  )

  const monthlyTotal = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses],
  )

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Expenses</h2>
            <p className="mt-1 text-gray-600">
              Track expenses with category filters and monthly totals.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
          >
            New Expense
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
            aria-label="Filter expenses by category"
            title="Category filter"
          >
            <option value="All">All Categories</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
            aria-label="Filter expenses by month"
            title="Month filter"
          >
            <option value="All">All Months</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-04">Apr 2026</option>
          </select>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Filtered Monthly Total</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyTotal)}</p>
        </div>

        <ExpenseTable expenses={filteredExpenses} />
      </div>

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-2xl overflow-y-auto rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <h3 className="text-lg font-semibold text-[#1f2918]">Add Expense</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
                className="text-2xl leading-none text-[#6a6358] hover:text-[#1f2918]"
              >
                &times;
              </button>
            </div>

            <ExpenseForm
              onSubmit={() => {
                setIsAddModalOpen(false)
                router.refresh()
              }}
            />

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-[#cfc6ba] px-6 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageWrapper>
  )
}
