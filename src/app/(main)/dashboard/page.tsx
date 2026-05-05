import PageWrapper from "@/components/layout/PageWrapper"

export default function DashboardPage() {
  return (
    <PageWrapper className="py-4">
      <div className="space-y-4">
        <div className="rounded-lg border border-[#d8ddd5] bg-[#f1f3ef] px-4 py-2">
          <h2 className="text-3xl font-bold text-[#1f2b1f]">Dashboard</h2>
          <p className="mt-1 text-[#617361]">
            Welcome to Relevare - Skincare Management System
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#d8ddd5] bg-white p-6">
            <h3 className="text-lg font-semibold text-[#1f2b1f]">Today&apos;s Sales</h3>
            <p className="text-2xl font-bold text-[#244826]">₱0.00</p>
          </div>
          <div className="rounded-lg border border-[#d8ddd5] bg-white p-6">
            <h3 className="text-lg font-semibold text-[#1f2b1f]">Active Clients</h3>
            <p className="text-2xl font-bold text-[#244826]">0</p>
          </div>
          <div className="rounded-lg border border-[#d8ddd5] bg-white p-6">
            <h3 className="text-lg font-semibold text-[#1f2b1f]">Low Stock Items</h3>
            <p className="text-2xl font-bold text-[#244826]">0</p>
          </div>
          <div className="rounded-lg border border-[#d8ddd5] bg-white p-6">
            <h3 className="text-lg font-semibold text-[#1f2b1f]">Pending Transactions</h3>
            <p className="text-2xl font-bold text-[#244826]">0</p>
          </div>
        </div>

        {/* Charts and Recent Activity Placeholder */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[#d8ddd5] bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#1f2b1f]">Sales Chart</h3>
            <div className="flex h-64 items-center justify-center rounded bg-[#f1f3ef]">
              <p className="text-[#7d8f7d]">Sales chart will be displayed here</p>
            </div>
          </div>
          <div className="rounded-lg border border-[#d8ddd5] bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-[#1f2b1f]">Recent Transactions</h3>
            <div className="space-y-3">
              <p className="text-[#7d8f7d]">Recent transactions will be listed here</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
