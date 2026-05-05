interface ClientPackage {
  id: string
  packageName: string
  sessionsRemaining: number
  expiresAt: string
}

interface PackageRedemptionSelectProps {
  packages: ClientPackage[]
  selectedPackageId: string | null
  onSelect: (packageId: string | null, sessionPrice: number) => void
}

export default function PackageRedemptionSelect({
  packages,
  selectedPackageId,
  onSelect,
}: PackageRedemptionSelectProps) {
  const selectedPackage = packages.find((p) => p.id === selectedPackageId)
  const isExpired = selectedPackage
    ? new Date(selectedPackage.expiresAt) < new Date()
    : false

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Redeem Package (Optional)
      </label>

      {packages.length === 0 ? (
        <p className="text-sm text-gray-600">No active packages for this client</p>
      ) : (
        <select
          value={selectedPackageId || ""}
          onChange={(e) => {
            const packageId = e.target.value || null
            onSelect(packageId, 0) // Price set to 0 for package redemptions
          }}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">-- No package --</option>
          {packages.map((pkg) => {
            const expired =
              new Date(pkg.expiresAt) < new Date()
            return (
              <option
                key={pkg.id}
                value={pkg.id}
                disabled={expired}
              >
                {pkg.packageName} ({pkg.sessionsRemaining} sessions remaining)
                {expired ? " [EXPIRED]" : ""}
              </option>
            )
          })}
        </select>
      )}

      {selectedPackage && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <div className="space-y-1 text-sm">
            <p className="font-medium text-blue-900">{selectedPackage.packageName}</p>
            <p className="text-blue-800">
              Sessions remaining: <strong>{selectedPackage.sessionsRemaining}</strong>
            </p>
            {isExpired && (
              <p className="text-orange-600">⚠ Package expired on {new Date(selectedPackage.expiresAt).toLocaleDateString()}</p>
            )}
            <p className="text-blue-700">✓ This session is FREE (charged to package)</p>
          </div>
        </div>
      )}
    </div>
  )
}
