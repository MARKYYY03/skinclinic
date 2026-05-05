interface SessionProgressBarProps {
  totalSessions: number
  sessionsUsed: number
}

export default function SessionProgressBar({
  totalSessions,
  sessionsUsed,
}: SessionProgressBarProps) {
  const safeTotal = Math.max(totalSessions, 1)
  const percentage = Math.min(100, (sessionsUsed / safeTotal) * 100)

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-gray-600">
        <span>{sessionsUsed} used</span>
        <span>{safeTotal - sessionsUsed} remaining</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
