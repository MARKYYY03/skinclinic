"use client"

import { useEffect, useState } from "react"
import KpiCard from "@/components/dashboard/KpiCard"
import RecentTransactions from "@/components/dashboard/RecentTransactions"
import SalesChart from "@/components/dashboard/SalesChart"
import StaffCommissionsWidget from "@/components/dashboard/StaffCommissionsWidget"
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

export default function DashboardPage() {
  const [viewType, setViewType] = useState<"weekly" | "monthly">("weekly")
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([])
  const [todaySales, setTodaySales] = useState(0)
  const [activeClients, setActiveClients] = useState(0)
  const [pendingAr, setPendingAr] = useState(0)
  const [monthCommissions, setMonthCommissions] = useState(0)
  const [topStaffCommissions, setTopStaffCommissions] = useState<StaffCommissionRow[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      try {
        const today = new Date()
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const startOfRange = new Date(startOfToday)
        if (viewType === "weekly") {
          startOfRange.setDate(startOfRange.getDate() - 6)
        } else {
          startOfRange.setDate(1)
        }

        const [{ data: salesRows }, { count: activeClientsCount }, { data: arRows }, { data: commRows }, { data: recentRows }, { data: rangeRows }] = await Promise.all([
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
            .from("transactions")
            .select("id, created_at, net_amount")
            .gte("created_at", startOfRange.toISOString()),
        ])

        // Today's sales
        const today_sales = (salesRows ?? []).reduce((sum, row) => sum + Number(row.net_amount ?? 0), 0)
        setTodaySales(today_sales)

        // Active clients
        setActiveClients(activeClientsCount ?? 0)

        // Pending AR
        const pending = (arRows ?? []).reduce((sum, row) => sum + Number(row.balance_due ?? 0), 0)
        setPendingAr(pending)

        // Build sales chart data
        const dayCount = viewType === "weekly" ? 7 : 30
        const labels = Array.from({ length: dayCount }).map((_, index) => {
          const date = new Date(startOfRange)
          date.setDate(startOfRange.getDate() + index)
          const dateKey = date.toISOString().slice(0, 10)
          if (viewType === "weekly") {
            return date.toLocaleDateString("en-US", { weekday: "short" })
          } else {
            return dateKey
          }
        })

        const dailyMap = new Map<string, number>()
        Array.from({ length: dayCount }).forEach((_, index) => {
          const date = new Date(startOfRange)
          date.setDate(startOfRange.getDate() + index)
          const dateKey = date.toISOString().slice(0, 10)
          dailyMap.set(dateKey, 0)
        })

        ;(rangeRows ?? []).forEach((row) => {
          const dayKey = row.created_at?.slice(0, 10)
          if (dayKey && dailyMap.has(dayKey)) {
            dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + Number(row.net_amount ?? 0))
          }
        })

        const chartData = Array.from(dailyMap.entries()).map(([_, amount], index) => ({
          label: labels[index],
          amount,
        }))
        setSalesData(chartData)

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
        console.error("Dashboard load error:", error)
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [viewType])

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
          <div>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as "weekly" | "monthly")}
              className="rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-sm font-medium text-[#314031] hover:border-[#b8b0a0]"
              aria-label="Chart view"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
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
            title="Month Commissions"
            value={formatCurrency(monthCommissions)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SalesChart data={salesData} />
          </div>
          <div className="space-y-4">
            <StaffCommissionsWidget rows={topStaffCommissions} />
          </div>
        </div>

        <RecentTransactions rows={recentTransactions} />
      </div>
    </PageWrapper>
  )
}
