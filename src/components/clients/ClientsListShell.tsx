"use client"

import Link from "next/link"
import { useState } from "react"

import { Client } from "@/types/client"
import ClientTable from "./ClientTable"

interface ClientsListShellProps {
  clients: Client[]
  showAdd: boolean
}

export default function ClientsListShell({
  clients,
  showAdd,
}: ClientsListShellProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#1f2918]">Clients</h2>
          <p className="mt-1 text-sm text-[#5c564c]">Manage client profiles</p>
        </div>
        {showAdd ? (
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
          >
            Add New Client
          </Link>
        ) : null}
      </div>

      <div className="rounded-xl border border-[#dfd8cf] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Search by name or contact number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search clients"
            className="flex-1 rounded-lg border border-[#cfc6ba] bg-[#F5F0E8]/40 px-3 py-2 text-[#1f2918] outline-none focus:border-[#6B7A3E] focus:ring-1 focus:ring-[#6B7A3E]"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter clients by category"
            title="Client category filter"
            className="rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-[#1f2918] outline-none focus:border-[#6B7A3E] focus:ring-1 focus:ring-[#6B7A3E]"
          >
            <option value="All">All categories</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#cfd4b8] bg-[#F5F0E8]/80 py-14 text-center">
          <p className="font-medium text-[#314031]">No clients found</p>
          <p className="mt-1 text-sm text-[#6a6358]">
            Add your first client to get started.
          </p>
          {showAdd ? (
            <Link
              href="/clients/new"
              className="mt-4 inline-block rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
            >
              Add New Client
            </Link>
          ) : null}
        </div>
      ) : (
        <ClientTable
          clients={clients}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
        />
      )}
    </div>
  )
}
