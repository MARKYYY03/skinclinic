import KpiCard from "@/components/dashboard/KpiCard"
import RecentTransactions from "@/components/dashboard/RecentTransactions"
import PageWrapper from "@/components/layout/PageWrapper"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [{ data: salesRows }, { count: activeClients }, { data: arRows }, { data: commRows }, { data: recentRows }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("net_amount")
        .gte("created_at", startOfToday.toISOString())
        .neq("status", "Voided"),
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("transactions").select("balance_due").eq("status", "Partial"),
      supabase
        .from("commissions")
        .select("commission_amount")
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("transactions")
        .select("id, client_name, net_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const todaySales = (salesRows ?? []).reduce((sum, row) => sum + Number(row.net_amount ?? 0), 0)
  const pendingAr = (arRows ?? []).reduce((sum, row) => sum + Number(row.balance_due ?? 0), 0)
  const monthCommissions = (commRows ?? []).reduce(
    (sum, row) => sum + Number(row.commission_amount ?? 0),
    0,
  )

  return (
    <PageWrapper className="py-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[#1f2918]">Dashboard</h2>
          <p className="mt-1 text-[#6a6358]">Live performance snapshot</p>
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
            title="Total Commissions (This Month)"
            value={formatCurrency(monthCommissions)}
          />
        </div>

        <RecentTransactions
          rows={(recentRows ?? []).map((row) => ({
            id: row.id,
            clientName: row.client_name ?? "Walk-in",
            netAmount: Number(row.net_amount ?? 0),
            status: row.status ?? "Completed",
            createdAt: row.created_at,
          }))}
        />
      </div>
    </PageWrapper>
  )
}
