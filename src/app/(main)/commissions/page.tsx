"use client"

import { useMemo, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import CommissionTable from "@/components/commissions/CommissionTable"
import StaffCommissionCard from "@/components/commissions/StaffCommissionCard"
import { mockCommissionSplits } from "@/lib/mock/phase6"

export default function CommissionsPage() {
  const [staffFilter, setStaffFilter] = useState("All")
  const [monthFilter, setMonthFilter] = useState("All")

  const staffOptions = useMemo(
    () =>
      Array.from(
        new Set(
          mockCommissionSplits.flatMap((entry) => entry.staffShares.map((share) => share.staffName)),
        ),
      ),
    [],
  )

  const filteredEntries = useMemo(
    () =>
      mockCommissionSplits.filter((entry) => {
        const monthKey = new Date(entry.date).toISOString().slice(0, 7)
        const matchMonth = monthFilter === "All" || monthKey === monthFilter
        const matchStaff =
          staffFilter === "All" ||
          entry.staffShares.some((share) => share.staffName === staffFilter)
        return matchMonth && matchStaff
      }),
    [monthFilter, staffFilter],
  )

  const staffSummaries = useMemo(() => {
    const summaryMap = new Map<string, { total: number; transactions: number }>()
    filteredEntries.forEach((entry) => {
      entry.staffShares.forEach((share) => {
        const current = summaryMap.get(share.staffName) ?? { total: 0, transactions: 0 }
        summaryMap.set(share.staffName, {
          total: current.total + share.amount,
          transactions: current.transactions + 1,
        })
      })
    })
    return Array.from(summaryMap.entries()).map(([staffName, data]) => ({
      staffName,
      totalCommission: data.total,
      transactionCount: data.transactions,
    }))
  }, [filteredEntries])

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Commissions</h2>
          <p className="mt-1 text-gray-600">
            Per-staff commission summary with pool split per transaction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            value={staffFilter}
            onChange={(event) => setStaffFilter(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
            aria-label="Filter by staff"
            title="Staff filter"
          >
            <option value="All">All Staff</option>
            {staffOptions.map((staff) => (
              <option key={staff} value={staff}>
                {staff}
              </option>
            ))}
          </select>
          <select
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
            aria-label="Filter by month"
            title="Month filter"
          >
            <option value="All">All Months</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-04">Apr 2026</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {staffSummaries.map((summary) => (
            <StaffCommissionCard
              key={summary.staffName}
              staffName={summary.staffName}
              totalCommission={summary.totalCommission}
              transactionCount={summary.transactionCount}
            />
          ))}
        </div>

        <CommissionTable entries={filteredEntries} />
      </div>
    </PageWrapper>
  )
}
