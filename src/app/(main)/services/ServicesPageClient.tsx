"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import ServiceTable from "@/components/services/ServiceTable"
import { useCurrentUser } from "@/lib/auth/current-user"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import type { ServiceListRow } from "@/types/service"
import ServiceForm from "@/components/services/ServiceForm"

export default function ServicesPageClient() {
  const { role } = useCurrentUser()
  const canManage = role === "Owner" || role === "Admin"

  const [services, setServices] = useState<ServiceListRow[]>([])
  const [loading, setLoading] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [selectedService, setSelectedService] = useState<ServiceListRow | null>(null)
  const [modalSaving, setModalSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabaseClient
        .from("services")
        .select("id, name, description, category, price, commission_rate, is_active")
        .order("name")

      setServices((data ?? []) as ServiceListRow[])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const modalTitle = useMemo(() => {
    return modalMode === "add" ? "+ Add Service" : "Edit service"
  }, [modalMode])

  function openAddModal() {
    setModalMode("add")
    setSelectedService(null)
    setIsModalOpen(true)
  }

  function openEditModal(service: ServiceListRow) {
    setModalMode("edit")
    setSelectedService(service)
    setIsModalOpen(true)
  }

  async function handleSaved() {
    setModalSaving(true)
    try {
      // refresh list
      await load()
      // also ensure route state revalidates
      // (Service actions already revalidate on server; this is just for client list)
    } finally {
      setModalSaving(false)
      setIsModalOpen(false)
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1f2918]">Services</h2>
            <p className="mt-1 text-sm text-[#5c564c]">Catalog pricing, categories, and commission defaults.</p>
          </div>

          {canManage ? (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
            >
              + Add Service
            </button>
          ) : null}
        </div>

        <ServiceTable
          services={services}
          canManage={canManage}
          onEdit={openEditModal}
          onChanged={load}
        />
      </div>

      {isModalOpen && canManage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg overflow-y-auto rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-xl">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-[#1f2918]">
                {modalMode === "add" ? "Add service" : "Edit service"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="text-2xl leading-none text-[#6a6358] hover:text-[#1f2918]"
              >
                &times;
              </button>
            </div>

            {/* ServiceForm must only render the card contents (no fixed overlay) */}
            <ServiceForm
              initialData={
                modalMode === "edit" && selectedService
                  ? selectedService
                  : ({
                      id: "",
                      name: "",
                      description: null,
                      category: null,
                      price: 0,
                      commission_rate: 0,
                      is_active: true,
                    } as ServiceListRow)
              }
              onCancel={() => setIsModalOpen(false)}
              onSuccess={handleSaved}
            />
          </div>
        </div>
      ) : null}
    </PageWrapper>
  )
}
