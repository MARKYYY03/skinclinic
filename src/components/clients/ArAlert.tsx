import { formatCurrency } from "@/lib/utils"

interface ArAlertProps {
  totalBalanceDuePeso: number
}

export default function ArAlert({ totalBalanceDuePeso }: ArAlertProps) {
  if (totalBalanceDuePeso <= 0) return null

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 shadow-sm">
      ⚠ Outstanding balance: {formatCurrency(totalBalanceDuePeso)}
    </div>
  )
}
