interface ExpiryBadgeProps {
  expirationDate?: string
}

export default function ExpiryBadge({ expirationDate }: ExpiryBadgeProps) {
  if (!expirationDate) {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
        No expiry
      </span>
    )
  }

  const expiryDate = new Date(expirationDate)
  const now = new Date()
  const msInDay = 1000 * 60 * 60 * 24
  const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / msInDay)

  if (daysToExpiry < 0) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
        Expired
      </span>
    )
  }

  if (daysToExpiry <= 30) {
    return (
      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
        Expiring soon
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
      Fresh
    </span>
  )
}
