"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Client } from "@/types/client"
import { formatDate } from "@/lib/utils"
import CategoryBadge from "./CategoryBadge"

interface ClientTableProps {
  clients: Client[]
  searchQuery: string
  categoryFilter: string
}

export default function ClientTable({ clients, searchQuery, categoryFilter }: ClientTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter clients based on search and category
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactNumber.includes(searchQuery) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = categoryFilter === "All" || client.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [clients, searchQuery, categoryFilter])

  // Paginate filtered clients
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-4">
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {paginatedClients.length} of {filteredClients.length} clients
        </p>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No clients found matching your criteria
                </td>
              </tr>
            ) : (
              paginatedClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {client.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.gender} • {formatDate(client.birthdate)}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{client.contactNumber}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <CategoryBadge category={client.category} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(client.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-blue-600 hover:text-blue-900"
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
