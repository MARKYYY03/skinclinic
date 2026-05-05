import { formatDate, formatCurrency } from "@/lib/utils"

interface ClientPackage {
  id: string
  packageName: string
  totalSessions: number
  sessionsUsed: number
  sessionsRemaining: number
  purchasedAt: string
  expiresAt: string
}

interface PackageStatusCardProps {
  clientId: string
}

export default function PackageStatusCard({ clientId }: PackageStatusCardProps) {
  // Mock data - replace with API call
  const mockPackages: ClientPackage[] = [
    {
      id: "1",
      packageName: "Premium Facial Package (5 sessions)",
      totalSessions: 5,
      sessionsUsed: 2,
      sessionsRemaining: 3,
      purchasedAt: "2024-01-01T00:00:00Z",
      expiresAt: "2025-01-01T00:00:00Z"
    },
    {
      id: "2",
      packageName: "Relaxation Massage (10 sessions)",
      totalSessions: 10,
      sessionsUsed: 7,
      sessionsRemaining: 3,
      purchasedAt: "2024-01-15T00:00:00Z",
      expiresAt: "2025-01-15T00:00:00Z"
    }
  ]

  const getProgressColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100
    if (percentage > 50) return "bg-green-500"
    if (percentage > 25) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getExpiryStatus = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { status: "Expired", color: "text-red-600" }
    if (daysUntilExpiry <= 30) return { status: `Expires in ${daysUntilExpiry} days`, color: "text-yellow-600" }
    return { status: `Expires ${formatDate(expiresAt)}`, color: "text-gray-600" }
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Active Packages</h3>
        <p className="mt-1 text-sm text-gray-600">Current package subscriptions and session progress</p>
      </div>

      <div className="p-6">
        {mockPackages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No active packages</p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
              Purchase a package
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {mockPackages.map((pkg) => {
              const progressPercentage = ((pkg.totalSessions - pkg.sessionsRemaining) / pkg.totalSessions) * 100
              const expiryInfo = getExpiryStatus(pkg.expiresAt)

              return (
                <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{pkg.packageName}</h4>
                      <p className="text-sm text-gray-500">
                        Purchased {formatDate(pkg.purchasedAt)}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${expiryInfo.color}`}>
                      {expiryInfo.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Sessions Used</span>
                      <span className="font-medium">
                        {pkg.sessionsUsed} of {pkg.totalSessions} ({pkg.sessionsRemaining} remaining)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(pkg.sessionsRemaining, pkg.totalSessions)}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                      Redeem Session
                    </button>
                    <button className="text-sm border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
