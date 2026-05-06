"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { Client } from "@/types/client"
import { formatDate } from "@/lib/utils"
import CategoryBadge from "./CategoryBadge"

interface ClientTableProps {
  clients: Client[]
  searchQuery: string
  categoryFilter: string
}

export default function ClientTable({
  clients,
  searchQuery,
  categoryFilter,
}: ClientTableProps) {
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const normalizedQuery = searchQuery.trim().replace(/\s+/g, "").toLowerCase()

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        !normalizedQuery ||
        client.fullName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        client.contactNumber
          .trim()
          .replace(/\s+/g, "")
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesCategory =
        categoryFilter === "All" || client.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [clients, categoryFilter, normalizedQuery, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage))

  const currentPage = Math.min(page, totalPages)

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#6a6358]">
          Showing{" "}
          <span className="font-semibold text-[#314031]">
            {paginatedClients.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#314031]">{filteredClients.length}</span>
        </p>
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-[#cfc6ba] px-3 py-1 text-sm text-[#314031] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#F5F0E8]"
            >
              Previous
            </button>
            <span className="text-sm text-[#6a6358]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-[#cfc6ba] px-3 py-1 text-sm text-[#314031] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#F5F0E8]"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/70">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Full name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Contact number
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Created at
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4] bg-white">
            {filteredClients.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-[#6a6358]"
                >
                  No clients match this search or filter
                </td>
              </tr>
            ) : (
              paginatedClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#F5F0E8]/35">
                  <td className="px-6 py-4 text-sm font-medium text-[#1f2918]">
                    {client.fullName}
                  </td>
                  <td className="max-w-[12rem] truncate px-6 py-4 text-sm text-[#314031]">
                    {client.contactNumber || "—"}
                  </td>
                  <td className="max-w-[14rem] truncate px-6 py-4 text-sm text-[#314031]">
                    {client.email && client.email !== "—" ? client.email : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <CategoryBadge category={client.category} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#6a6358]">
                    {formatDate(client.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-[#6B7A3E] hover:text-[#5a6734]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
