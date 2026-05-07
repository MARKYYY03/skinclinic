"use client"

import { useEffect, useState } from "react"
import KpiCard from "@/components/dashboard/KpiCard"
import RecentTransactions from "@/components/dashboard/RecentTransactions"
import PaymentMethodsChart from "@/components/dashboard/PaymentMethodsChart"
import SalesChart from "@/components/dashboard/SalesChart"
import ServicesChart from "@/components/dashboard/ServicesChart"
import StaffCommissionsWidget from "@/components/dashboard/StaffCommissionsWidget"
import TransactionChart from "@/components/dashboard/TransactionChart"
import PageWrapper from "@/components/layout/PageWrapper"
import { supabaseClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"

interface StaffCommissionRow {
  staffName: string
  total: number
}

interface SalesDataPoint {
  label: string
  amount: number
}

interface TransactionDataPoint {
  label: string
  count: number
}

interface PaymentMethodDataPoint {
  method: "Cash" | "GCash" | "Maya" | "Card" | "BankTransfer" | "HomeCredit"
  count: number
}

interface ServiceDataPoint {
  name: string
  count: number
}

export default function DashboardPage() {
  const toLocalDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const [salesViewType, setSalesViewType] = useState<"weekly" | "monthly">("weekly")
  const [transactionViewType, setTransactionViewType] = useState<"weekly" | "monthly">("weekly")
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([])
  const [transactionData, setTransactionData] = useState<TransactionDataPoint[]>([])
  const [todaySales, setTodaySales] = useState(0)
  const [activeClients, setActiveClients] = useState(0)
  const [pendingAr, setPendingAr] = useState(0)
  const [monthCommissions, setMonthCommissions] = useState(0)
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodDataPoint[]>([])
  const [serviceData, setServiceData] = useState<ServiceDataPoint[]>([])
  const [topStaffCommissions, setTopStaffCommissions] = useState<StaffCommissionRow[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartsLoading, setChartsLoading] = useState(false)

  // Initial dashboard data load (runs once on mount)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        const today = new Date()
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const [
          { data: salesRows },
          { count: activeClientsCount },
          { data: arRows },
          { data: commRows },
          { data: recentRows },
          { data: serviceRows },
          { data: paymentRows },
        ] = await Promise.all([
          supabaseClient
            .from("transactions")
            .select("net_amount")
            .gte("created_at", startOfToday.toISOString())
            .neq("status", "Voided"),
          supabaseClient
            .from("clients")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
          supabaseClient.from("transactions").select("balance_due").eq("status", "Partial"),
          supabaseClient
            .from("commissions")
            .select("staff_id, commission_amount")
            .gte("created_at", startOfMonth.toISOString()),
          supabaseClient
            .from("transactions")
            .select("id, client_name, net_amount, status, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabaseClient
            .from("transaction_items")
            .select("item_name, quantity, transactions!inner(created_at, status)")
            .eq("item_type", "service")
            .gte("transactions.created_at", startOfMonth.toISOString())
            .neq("transactions.status", "Voided"),
          supabaseClient
            .from("transaction_payments")
            .select("method, transactions!inner(created_at, status)")
            .gte("transactions.created_at", startOfMonth.toISOString())
            .neq("transactions.status", "Voided"),
        ])

        // Today's sales
        const today_sales = (salesRows ?? []).reduce((sum, row) => sum + Number(row.net_amount ?? 0), 0)
        setTodaySales(today_sales)

        // Active clients
        setActiveClients(activeClientsCount ?? 0)

        // Pending AR
        const pending = (arRows ?? []).reduce((sum, row) => sum + Number(row.balance_due ?? 0), 0)
        setPendingAr(pending)

        // Staff commissions
        const staffTotals = new Map<string, number>()
        ;(commRows ?? []).forEach((row) => {
          if (!row.staff_id) return
          staffTotals.set(
            row.staff_id,
            (staffTotals.get(row.staff_id) ?? 0) + Number(row.commission_amount ?? 0),
          )
        })

        const staffIds = Array.from(staffTotals.keys())
        const staffProfiles = staffIds.length
          ? await supabaseClient.from("profiles").select("id, full_name").in("id", staffIds)
          : { data: [] as Array<{ id: string; full_name: string | null }> }

        const staffNameById = new Map(
          (staffProfiles.data ?? []).map((profile) => [profile.id, profile.full_name ?? "Unknown"]),
        )
        const topStaff = Array.from(staffTotals.entries())
          .map(([staffId, total]) => ({
            staffName: staffNameById.get(staffId) ?? "Unknown",
            total,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 3)
        setTopStaffCommissions(topStaff)

        const monthComm = (commRows ?? []).reduce(
          (sum, row) => sum + Number(row.commission_amount ?? 0),
          0,
        )
        setMonthCommissions(monthComm)

        const paymentMethods: PaymentMethodDataPoint["method"][] = [
          "Cash",
          "GCash",
          "Maya",
          "Card",
          "BankTransfer",
          "HomeCredit",
        ]
        const paymentCountMap = new Map<PaymentMethodDataPoint["method"], number>()
        paymentMethods.forEach((method) => paymentCountMap.set(method, 0))
        ;(paymentRows ?? []).forEach((row) => {
          const method = row.method as PaymentMethodDataPoint["method"] | null
          if (method && paymentCountMap.has(method)) {
            paymentCountMap.set(method, (paymentCountMap.get(method) ?? 0) + 1)
          }
        })
        setPaymentMethodData(
          paymentMethods.map((method) => ({
            method,
            count: paymentCountMap.get(method) ?? 0,
          })),
        )

        const serviceCountMap = new Map<string, number>()
        ;(serviceRows ?? []).forEach((row) => {
          const serviceName = (row.item_name ?? "").trim()
          if (!serviceName) return
          const qty = Math.max(1, Number(row.quantity ?? 1))
          serviceCountMap.set(serviceName, (serviceCountMap.get(serviceName) ?? 0) + qty)
        })
        setServiceData(
          Array.from(serviceCountMap.entries()).map(([name, count]) => ({
            name,
            count,
          })),
        )

        // Recent transactions
        setRecentTransactions(
          (recentRows ?? []).map((row) => ({
            id: row.id,
            clientName: row.client_name ?? "Walk-in",
            netAmount: Number(row.net_amount ?? 0),
            status: row.status ?? "Completed",
            createdAt: row.created_at,
          })),
        )
      } catch (error) {
        console.error("Dashboard initial load error:", error)
      } finally {
        setLoading(false)
      }
    }

    void loadInitialData()
  }, [])

  // Sales chart data load (only when salesViewType changes)
  useEffect(() => {
    const loadSalesData = async () => {
      setChartsLoading(true)
      try {
        const today = new Date()
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const getRangeStart = (type: "weekly" | "monthly") => {
          const start = new Date(startOfToday)
          if (type === "weekly") {
            const dayOfWeek = start.getDay()
            start.setDate(start.getDate() - dayOfWeek)
          } else {
            start.setDate(1)
            start.setMonth(0)
          }
          return start
        }

        const salesStartOfRange = getRangeStart(salesViewType)

        const { data: salesRangeRows } = await supabaseClient
          .from("transactions")
          .select("id, created_at, net_amount")
          .gte("created_at", salesStartOfRange.toISOString())
          .neq("status", "Voided")

        // Build sales chart data
        let chartData: SalesDataPoint[] = []
        if (salesViewType === "weekly") {
          const dayCount = 7
          const labels = Array.from({ length: dayCount }).map((_, index) => {
            const date = new Date(salesStartOfRange)
            date.setDate(salesStartOfRange.getDate() + index)
            return date.toLocaleDateString("en-US", { weekday: "short" })
          })

          const dailyMap = new Map<string, number>()
          Array.from({ length: dayCount }).forEach((_, index) => {
            const date = new Date(salesStartOfRange)
            date.setDate(salesStartOfRange.getDate() + index)
            const dateKey = toLocalDateKey(date)
            dailyMap.set(dateKey, 0)
          })

          ;(salesRangeRows ?? []).forEach((row) => {
            const createdAt = row.created_at ? new Date(row.created_at) : null
            const dayKey = createdAt ? toLocalDateKey(createdAt) : null
            if (dayKey && dailyMap.has(dayKey)) {
              dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + Number(row.net_amount ?? 0))
            }
          })

          chartData = Array.from(dailyMap.entries()).map(([_, amount], index) => ({
            label: labels[index],
            amount,
          }))
        } else {
          const monthCount = 12
          const monthSlots = Array.from({ length: monthCount }).map((_, index) => {
            const date = new Date(salesStartOfRange.getFullYear(), index, 1)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            const label = date.toLocaleDateString("en-US", { month: "short" })
            return { monthKey, label }
          })

          const monthlyMap = new Map<string, number>()
          monthSlots.forEach(({ monthKey }) => {
            monthlyMap.set(monthKey, 0)
          })

          ;(salesRangeRows ?? []).forEach((row) => {
            const createdAt = row.created_at ? new Date(row.created_at) : null
            if (!createdAt || Number.isNaN(createdAt.getTime())) return

            const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`
            if (monthlyMap.has(monthKey)) {
              monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + Number(row.net_amount ?? 0))
            }
          })

          chartData = monthSlots.map(({ monthKey, label }) => ({
            label,
            amount: monthlyMap.get(monthKey) ?? 0,
          }))
        }
        setSalesData(chartData)
      } catch (error) {
        console.error("Sales chart load error:", error)
      } finally {
        setChartsLoading(false)
      }
    }

    void loadSalesData()
  }, [salesViewType])

  // Transaction chart data load (only when transactionViewType changes)
  useEffect(() => {
    const loadTransactionData = async () => {
      setChartsLoading(true)
      try {
        const today = new Date()
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const getRangeStart = (type: "weekly" | "monthly") => {
          const start = new Date(startOfToday)
          if (type === "weekly") {
            const dayOfWeek = start.getDay()
            start.setDate(start.getDate() - dayOfWeek)
          } else {
            start.setDate(1)
            start.setMonth(0)
          }
          return start
        }

        const transactionStartOfRange = getRangeStart(transactionViewType)

        const { data: transactionRangeRows } = await supabaseClient
          .from("transactions")
          .select("id, created_at")
          .gte("created_at", transactionStartOfRange.toISOString())
          .neq("status", "Voided")

        // Build transaction chart data
        let txData: TransactionDataPoint[] = []
        if (transactionViewType === "weekly") {
          const dayCount = 7
          const labels = Array.from({ length: dayCount }).map((_, index) => {
            const date = new Date(transactionStartOfRange)
            date.setDate(transactionStartOfRange.getDate() + index)
            return date.toLocaleDateString("en-US", { weekday: "short" })
          })

          const transactionCountMap = new Map<string, number>()
          Array.from({ length: dayCount }).forEach((_, index) => {
            const date = new Date(transactionStartOfRange)
            date.setDate(transactionStartOfRange.getDate() + index)
            transactionCountMap.set(toLocalDateKey(date), 0)
          })

          ;(transactionRangeRows ?? []).forEach((row) => {
            const createdAt = row.created_at ? new Date(row.created_at) : null
            const dayKey = createdAt ? toLocalDateKey(createdAt) : null
            if (dayKey && transactionCountMap.has(dayKey)) {
              transactionCountMap.set(dayKey, (transactionCountMap.get(dayKey) ?? 0) + 1)
            }
          })

          txData = Array.from(transactionCountMap.entries()).map(([_, count], index) => ({
            label: labels[index],
            count,
          }))
        } else {
          const monthCount = 12
          const monthSlots = Array.from({ length: monthCount }).map((_, index) => {
            const date = new Date(transactionStartOfRange.getFullYear(), index, 1)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            const label = date.toLocaleDateString("en-US", { month: "short" })
            return { monthKey, label }
          })

          const monthlyTransactionCountMap = new Map<string, number>()
          monthSlots.forEach(({ monthKey }) => {
            monthlyTransactionCountMap.set(monthKey, 0)
          })

          ;(transactionRangeRows ?? []).forEach((row) => {
            const createdAt = row.created_at ? new Date(row.created_at) : null
            if (!createdAt || Number.isNaN(createdAt.getTime())) return
            const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`
            if (monthlyTransactionCountMap.has(monthKey)) {
              monthlyTransactionCountMap.set(
                monthKey,
                (monthlyTransactionCountMap.get(monthKey) ?? 0) + 1,
              )
            }
          })

          txData = monthSlots.map(({ monthKey, label }) => ({
            label,
            count: monthlyTransactionCountMap.get(monthKey) ?? 0,
          }))
        }
        setTransactionData(txData)
      } catch (error) {
        console.error("Transaction chart load error:", error)
      } finally {
        setChartsLoading(false)
      }
    }

    void loadTransactionData()
  }, [transactionViewType])

  if (loading) {
    return (
      <PageWrapper className="py-4">
        <div className="text-center text-[#6a6358]">Loading dashboard...</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="py-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1f2918]">Dashboard</h2>
            <p className="mt-1 text-[#6a6358]">Live performance snapshot</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Today's Sales" value={formatCurrency(todaySales)} />
          <KpiCard title="Active Clients" value={String(activeClients ?? 0)} />
          <KpiCard
            title="Pending AR"
            value={formatCurrency(pendingAr)}
            tone={pendingAr > 0 ? "warning" : "default"}
          />
          <KpiCard
            title="Total Commissions This Month"
            value={formatCurrency(monthCommissions)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SalesChart
              data={salesData}
              viewType={salesViewType}
              onViewTypeChange={setSalesViewType}
            />
          </div>
          <div className="space-y-4">
            <StaffCommissionsWidget rows={topStaffCommissions} />
            <PaymentMethodsChart data={paymentMethodData} />
            <ServicesChart data={serviceData} />
          </div>
        </div>

        <TransactionChart
          data={transactionData}
          viewType={transactionViewType}
          onViewTypeChange={setTransactionViewType}
        />

        <RecentTransactions rows={recentTransactions} />
      </div>
    </PageWrapper>
  )
}
