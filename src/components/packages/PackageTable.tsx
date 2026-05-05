import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { ServicePackage } from "@/types/package"

interface PackageTableProps {
  packages: ServicePackage[]
}

export default function PackageTable({ packages }: PackageTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Package Name
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Sessions
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Validity (days)
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {packages.map((pkg) => (
            <tr key={pkg.id}>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{pkg.name}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-700">{pkg.sessionCount}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-700">
                {formatCurrency(pkg.price)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-700">{pkg.validityDays}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/packages/${pkg.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
