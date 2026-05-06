import { formatCurrency } from "@/lib/utils"
import { ServicePackage } from "@/types/package"

interface PackageTableProps {
  packages: ServicePackage[]
  canManage: boolean
  onEdit: (pkg: ServicePackage) => void
}

export default function PackageTable({ packages, canManage, onEdit }: PackageTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
      <table className="min-w-full divide-y divide-[#e5ded4]">
        <thead className="bg-[#F5F0E8]/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Package Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Service
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Sessions
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Validity (days)
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5ded4] bg-white">
          {packages.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#6a6358]">
                No package templates found.
              </td>
            </tr>
          ) : null}
          {packages.map((pkg) => (
            <tr key={pkg.id}>
              <td className="px-4 py-3 text-sm font-medium text-[#1f2918]">{pkg.name}</td>
              <td className="px-4 py-3 text-sm text-[#314031]">{pkg.serviceName ?? "—"}</td>
              <td className="px-4 py-3 text-right text-sm text-[#314031]">{pkg.sessionCount}</td>
              <td className="px-4 py-3 text-right text-sm text-[#314031]">
                {formatCurrency(pkg.price)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-[#314031]">{pkg.validityDays}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    pkg.isActive ? "bg-emerald-100 text-emerald-800" : "bg-[#e8e3dc] text-[#5c564c]"
                  }`}
                >
                  {pkg.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {canManage ? (
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#6B7A3E] hover:text-[#5a6734]"
                    onClick={() => onEdit(pkg)}
                  >
                    Edit
                  </button>
                ) : (
                  <span className="text-sm text-[#9a9288]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
