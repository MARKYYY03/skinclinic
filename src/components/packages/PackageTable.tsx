"use client"

import { formatCurrency } from "@/lib/utils"
import { ServicePackage } from "@/types/package"

interface PackageTableProps {
  packages: ServicePackage[]
  canManage: boolean
  onEdit: (pkg: ServicePackage) => void
}

function StatusPill({ active }: { active: boolean | undefined }) {
  const isActive = Boolean(active)
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isActive
          ? "bg-emerald-100 text-emerald-800"
          : "bg-[#e8e3dc] text-[#5c564c]"
      }`}
      aria-label={isActive ? "Active" : "Inactive"}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  )
}

import { useState } from "react"
import DataPaginator from "@/components/ui/DataPaginator"

export default function PackageTable({ packages, canManage, onEdit }: PackageTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(packages.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedPackages = packages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="space-y-0 rounded-xl border border-[#dfd8cf] bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto rounded-b-none">
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Package
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Service
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Sessions
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Total Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Validity
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
            {paginatedPackages.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-sm text-[#6a6358]">
                  {packages.length === 0 ? "No package templates found." : "No packages on this page."}
                </td>
              </tr>
            ) : null}

            {paginatedPackages.map((pkg) => (
              <tr key={pkg.id} className="transition-colors hover:bg-[#F5F0E8]/40">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-[#1f2918]">{pkg.name}</p>
                </td>

                <td className="px-4 py-3">
                  <span className="text-sm text-[#314031]">{pkg.serviceName ?? "—"}</span>
                </td>

                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-[#314031]">{pkg.sessionCount}</span>
                </td>

                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-semibold text-[#1f2918]">
                    {formatCurrency(pkg.price)}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-[#314031]">{pkg.validityDays} days</span>
                </td>

                <td className="px-4 py-3">
                  <StatusPill active={pkg.isActive} />
                </td>

                <td className="px-4 py-3 text-right">
                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => onEdit(pkg)}
                      className="rounded-lg px-2 py-1 text-sm font-semibold text-[#6B7A3E] hover:bg-[#F5F0E8] hover:text-[#5a6734]"
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

      <DataPaginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={packages.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}

