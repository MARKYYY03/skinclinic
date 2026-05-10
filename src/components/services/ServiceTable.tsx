"use client"

import { useState } from "react"

import type { ServiceListRow } from "@/types/service"
import { formatCurrency } from "@/lib/utils"
import DataPaginator from "@/components/ui/DataPaginator"

interface ServiceTableProps {
  services: ServiceListRow[]
  canManage: boolean
  onChanged: () => void | Promise<void>
  onEdit: (service: ServiceListRow) => void
}

export default function ServiceTable({
  services,
  canManage,
  onChanged: _onChanged,
  onEdit,
}: ServiceTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(services.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedServices = services.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
      <div className="overflow-x-auto rounded-b-none">
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Category
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Commission %
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
            {paginatedServices.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-[#6a6358]"
                >
                  No services yet. Add one to build your catalog.
                </td>
              </tr>
            ) : (
              paginatedServices.map((row) => (
                <tr key={row.id} className="hover:bg-[#F5F0E8]/40">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#1f2918]">
                      {row.name}
                    </p>
                    {row.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-[#6a6358]">
                        {row.description}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-sm text-[#314031]">
                    {row.category ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-medium text-[#1f2918]">
                    {formatCurrency(Number(row.price ?? 0))}
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-[#314031]">
                    {Number(row.commission_rate ?? 0)}%
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#e8e3dc] text-[#5c564c]"
                      }`}
                    >
                      {row.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {canManage ? (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="text-sm font-semibold text-[#6B7A3E] hover:text-[#5a6734]"
                      >
                        Edit
                      </button>
                    ) : (
                      <span className="text-sm text-[#9a9288]">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DataPaginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={services.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
