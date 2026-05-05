interface LowStockBadgeProps {
  stockQuantity: number
  lowStockThreshold: number
}

export default function LowStockBadge({
  stockQuantity,
  lowStockThreshold,
}: LowStockBadgeProps) {
  if (stockQuantity <= 0) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
        Out of stock
      </span>
    )
  }

  if (stockQuantity <= lowStockThreshold) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
        Low stock
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
      In stock
    </span>
  )
}
