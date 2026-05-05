import { formatCurrency } from "@/lib/utils"

interface StaffCommissionCardProps {
  staffName: string
  totalCommission: number
  transactionCount: number
}

export default function StaffCommissionCard({
  staffName,
  totalCommission,
  transactionCount,
}: StaffCommissionCardProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <p className="text-sm text-gray-600">{staffName}</p>
      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCommission)}</p>
      <p className="text-xs text-gray-500">{transactionCount} transaction split(s)</p>
    </div>
  )
}
