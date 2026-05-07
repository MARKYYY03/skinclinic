"use client"

import { useEffect, useState } from "react"

import ExportButton from "@/components/reports/ExportButton"
import ReportFilters from "@/components/reports/ReportFilters"
import SalesReportTable from "@/components/reports/SalesReportTable"
import { supabaseClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"

export default function SalesReportPage() {
  const now = new Date()
  const [startDate, setStartDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
  )
  const [endDate, setEndDate] = useState(
    new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
  )
  const [paymentMethodRows, setPaymentMethodRows] = useState<
    Array<{ method: string; transactionCount: number; totalAmount: number }>
  >([])
  const [dailyRows, setDailyRows] = useState<
    Array<{ date: string; transactionCount: number; gross: number; discount: number; net: number }>
  >([])
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalTransactions: 0,
    averagePerTransaction: 0,
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: txRows } = await supabaseClient
        .from("transactions")
        .select("id, created_at, total_amount, discount_total, net_amount, status")
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59`)
        .neq("status", "Voided")
      const txIds = (txRows ?? []).map((row) => row.id)

      const { data: paymentRows } = txIds.length
        ? await supabaseClient
            .from("transaction_payments")
            .select("transaction_id, method, amount")
            .in("transaction_id", txIds)
        : { data: [] as Array<{ transaction_id: string; method: string; amount: number }> }

      const methodMap = new Map<string, { txIds: Set<string>; totalAmount: number }>()
      ;(paymentRows ?? []).forEach((payment) => {
        const key = payment.method
        const current = methodMap.get(key) ?? { txIds: new Set<string>(), totalAmount: 0 }
        current.txIds.add(payment.transaction_id)
        current.totalAmount += Number(payment.amount ?? 0)
        methodMap.set(key, current)
      })

      const dailyMap = new Map<
        string,
        { transactionIds: Set<string>; gross: number; discount: number; net: number }
      >()
      ;(txRows ?? []).forEach((tx) => {
        const dayKey = tx.created_at.slice(0, 10)
        const current = dailyMap.get(dayKey) ?? {
          transactionIds: new Set<string>(),
          gross: 0,
          discount: 0,
          net: 0,
        }
        current.transactionIds.add(tx.id)
        current.gross += Number(tx.total_amount ?? 0)
        current.discount += Number(tx.discount_total ?? 0)
        current.net += Number(tx.net_amount ?? 0)
        dailyMap.set(dayKey, current)
      })

      const totalSales = (txRows ?? []).reduce((sum, tx) => sum + Number(tx.net_amount ?? 0), 0)
      const totalTransactions = txRows?.length ?? 0
      const averagePerTransaction = totalTransactions ? totalSales / totalTransactions : 0

      if (!cancelled) {
        setPaymentMethodRows(
          Array.from(methodMap.entries())
            .map(([method, value]) => ({
              method,
              transactionCount: value.txIds.size,
              totalAmount: value.totalAmount,
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount),
        )
        setDailyRows(
          Array.from(dailyMap.entries())
            .map(([date, value]) => ({
              date,
              transactionCount: value.transactionIds.size,
              gross: value.gross,
              discount: value.discount,
              net: value.net,
            }))
            .sort((a, b) => b.date.localeCompare(a.date)),
        )
        setSummary({
          totalSales,
          totalTransactions,
          averagePerTransaction,
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [endDate, startDate])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-[#1f2918]">Sales Report</h3>
        <ExportButton
          filename="sales-report.csv"
          headers={["Date", "Transactions", "Gross", "Discount", "Net"]}
          rows={dailyRows.map((row) => [
            row.date,
            row.transactionCount,
            row.gross,
            row.discount,
            row.net,
          ])}
        />
      </div>

      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[#dfd8cf] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#6a6358]">Total Sales</p>
          <p className="text-xl font-bold text-[#1f2918]">{formatCurrency(summary.totalSales)}</p>
        </div>
        <div className="rounded-xl border border-[#dfd8cf] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#6a6358]">Total Transactions</p>
          <p className="text-xl font-bold text-[#1f2918]">{summary.totalTransactions}</p>
        </div>
        <div className="rounded-xl border border-[#dfd8cf] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#6a6358]">Average per Transaction</p>
          <p className="text-xl font-bold text-[#1f2918]">
            {formatCurrency(summary.averagePerTransaction)}
          </p>
        </div>
      </div>

      <SalesReportTable paymentMethodRows={paymentMethodRows} dailyRows={dailyRows} />
    </div>
  )
}
