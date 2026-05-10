"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import PageWrapper from "@/components/layout/PageWrapper"
import ClientsListShell from "@/components/clients/ClientsListShell"
import { useCurrentUser } from "@/lib/auth/current-user"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { mapClientRowToClient, type ClientRowDb } from "@/lib/supabase/mappers-client"
import type { Client } from "@/types/client"
import ClientForm from "@/components/clients/ClientForm"

export default function ClientsPage() {
  const router = useRouter()
  const me = useCurrentUser()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const showAdd = me?.role !== "Staff"
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchClients = async () => {
    setLoading(true)
    try {
      const { data } = await supabaseClient
        .from("clients")
        .select(
          "id, full_name, contact_number, email, address, birthdate, gender, medical_history, allergies, notes, category, created_at",
        )
        .eq("is_active", true)
        .order("full_name", { ascending: true })

      setClients((data ?? []).map((row) => mapClientRowToClient(row as unknown as ClientRowDb)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchClients()
  }, [])

  const modalTitle = useMemo(() => "+ Add Client", [])

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1f2918]">Clients</h2>
            <p className="mt-1 text-sm text-[#5c564c]">Manage client profiles</p>
          </div>

          {showAdd ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
            >
              + Add Client
            </button>
          ) : null}
        </div>

        {/* Render list without navigation link / extra header */}
        <ClientsListShell clients={clients} showAdd={false} />

        {/* Modal (match Products page inline modal pattern) */}
        {isModalOpen ? (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            style={{ zIndex: 9999 }}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              style={{ zIndex: 10000 }}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalTitle}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  type="button"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="pt-2">
                  <ClientForm
                    initialData={undefined}
                    submitLabel="Save client"
                    cancelHref="/clients"
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={loading}
                    onSubmit={async (data) => {
                      // Create client
                      const payload = {
                        full_name: data.fullName,
                        contact_number: data.contactNumber,
                        email: data.email,
                        address: data.address,
                        birthdate: data.birthdate,
                        gender: data.gender,
                        medical_history: data.medicalHistory,
                        allergies: data.allergies,
                        notes: data.notes,
                        category: data.category,
                        is_active: true,
                      }

                      const { error } = await supabaseClient
                        .from("clients")
                        .insert(payload)
                      if (error) throw new Error(error.message)

                      setIsModalOpen(false)
                      router.refresh()
                      await fetchClients()
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageWrapper>
  )
}
