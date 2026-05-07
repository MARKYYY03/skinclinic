import { formatCurrency } from "@/lib/utils"

interface StaffCommissionRow {
  staffName: string
  total: number
}

interface StaffCommissionsWidgetProps {
  rows: StaffCommissionRow[]
}

export default function StaffCommissionsWidget({ rows }: StaffCommissionsWidgetProps) {
  const total = rows.reduce((sum, row) => sum + row.total, 0)
  const badgeLabel = rows.length <= 1 ? "Top earner" : "Top 3"

  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-[#1f2918]">Top Commissions</p>
        <p className="mt-1 text-xs text-[#6a6358]">Staff earnings this month</p>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#f8f5ef] px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#6a6358]">{badgeLabel}</p>
          <p className="mt-1 text-2xl font-semibold text-[#1f2918]">{formatCurrency(total)}</p>
        </div>
        <div className="rounded-full bg-[#e7f5e8] px-3 py-2 text-sm font-semibold text-[#1f5b2b]">
          {rows.length} staff
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-[#6a6358]">No commission entries found.</p>
        ) : (
          rows.map((row) => (
            <div key={row.staffName} className="flex items-center justify-between gap-3 rounded-2xl border border-[#ece6d8] px-3 py-3">
              <div>
                <p className="text-sm font-semibold text-[#1f2918]">{row.staffName}</p>
                <p className="text-xs text-[#6a6358]">Commission total</p>
              </div>
              <p className="text-sm font-semibold text-[#1f2918]">{formatCurrency(row.total)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
