"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import PageWrapper from "@/components/layout/PageWrapper"
import TransactionTable from "@/components/transactions/TransactionTable"
import { mockCashiers, mockTransactions } from "@/lib/mock/transactions"

export default function TransactionsPage() {
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [cashierFilter, setCashierFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTransactions = useMemo(
    () =>
      mockTransactions.filter((transaction) => {
        const transactionDate = transaction.createdAt.slice(0, 10)
        const matchDate = !dateFilter || transactionDate === dateFilter
        const matchStatus = statusFilter === "All" || transaction.status === statusFilter
        const matchCashier =
          cashierFilter === "All" || transaction.createdBy === cashierFilter
        const normalizedQuery = searchQuery.trim().toLowerCase()
        const matchSearch =
          !normalizedQuery ||
          transaction.id.toLowerCase().includes(normalizedQuery) ||
          transaction.clientName.toLowerCase().includes(normalizedQuery)

        return matchDate && matchStatus && matchCashier && matchSearch
      }),
    [cashierFilter, dateFilter, searchQuery, statusFilter],
  )

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Transactions</h2>
            <p className="mt-1 text-gray-600">
              Manage sales transactions and billing
            </p>
          </div>
          <Link
            href="/transactions/new"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            New Transaction
          </Link>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              aria-label="Filter transactions by date"
              title="Filter by date"
              className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter transactions by status"
              title="Filter by status"
              className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Partial">Partial</option>
              <option value="Voided">Voided</option>
            </select>
            <select
              value={cashierFilter}
              onChange={(event) => setCashierFilter(event.target.value)}
              aria-label="Filter transactions by cashier"
              title="Filter by cashier"
              className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Cashiers</option>
              {mockCashiers.map((cashier) => (
                <option key={cashier} value={cashier}>
                  {cashier}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by ID or client..."
              className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <TransactionTable transactions={filteredTransactions} />
      </div>
    </PageWrapper>
  )
}
