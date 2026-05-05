"use client"

import { useState } from "react"
import Link from "next/link"
import PageWrapper from "@/components/layout/PageWrapper"
import ClientTable from "@/components/clients/ClientTable"
import { Client } from "@/types/client"

// Mock data - replace with API call later
const mockClients: Client[] = [
  {
    id: "1",
    fullName: "Maria Santos",
    contactNumber: "+639123456789",
    email: "maria.santos@email.com",
    address: "123 Main St, Olongapo City",
    birthdate: "1990-05-15",
    gender: "Female",
    medicalHistory: "Hypertension",
    allergies: "Penicillin",
    notes: "Prefers morning appointments",
    category: "VIP",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    fullName: "Juan dela Cruz",
    contactNumber: "+639987654321",
    email: "juan.delacruz@email.com",
    address: "456 Oak Ave, Olongapo City",
    birthdate: "1985-08-22",
    gender: "Male",
    category: "Regular",
    createdAt: "2024-01-20T14:30:00Z"
  },
  {
    id: "3",
    fullName: "Ana Reyes",
    contactNumber: "+639555123456",
    email: "ana.reyes@email.com",
    address: "789 Pine St, Olongapo City",
    birthdate: "1992-12-03",
    gender: "Female",
    medicalHistory: "Diabetes",
    category: "VIP",
    createdAt: "2024-01-25T09:15:00Z"
  }
]

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Clients</h2>
            <p className="mt-1 text-gray-600">Manage your client database</p>
          </div>
          <Link
            href="/clients/new"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add New Client
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
        </div>

        {/* Clients Table */}
        <ClientTable
          clients={mockClients}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
        />
      </div>
    </PageWrapper>
  )
}
