"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import PageWrapper from "@/components/layout/PageWrapper"
import PackageTable from "@/components/packages/PackageTable"
import {
  createServicePackageAction,
  updateServicePackageAction,
} from "@/lib/actions/packages"
import { supabaseClient } from "@/lib/supabase/client"
import type { ServicePackage } from "@/types/package"
import type { UserRole } from "@/types/user"

type ActiveService = {
  id: string
  name: string
}

type PackageFormState = {
  name: string
  serviceId: string
  sessionCount: 3 | 5 | 10 | 15
  price: number
  validityDays: number
  isActive: boolean
}

function makeDefaultDraft(): PackageFormState {
  return {
    name: "",
    serviceId: "",
    sessionCount: 5,
    price: 0,
    validityDays: 365,
    isActive: true,
  }
}

export default function PackagesPageClient() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [meRole, setMeRole] = useState<UserRole | null>(null)
  const [services, setServices] = useState<ActiveService[]>([])
  const [packages, setPackages] = useState<ServicePackage[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<ServicePackage | null>(null)
  const [draft, setDraft] = useState<PackageFormState>(makeDefaultDraft())
  const [modalError, setModalError] = useState<string | null>(null)

  const canManage = meRole === "Owner" || meRole === "Admin"

  const selectedServiceName = useMemo(
    () => services.find((service) => service.id === draft.serviceId)?.name ?? "",
    [draft.serviceId, services],
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [{ data: auth }, { data: serviceRows }, { data: packageRows, error: packageErr }] =
      await Promise.all([
        supabaseClient.auth.getUser(),
        supabaseClient
          .from("services")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),
        supabaseClient
          .from("service_packages")
          .select("id, name, service_id, session_count, price, validity_days, is_active, services(name)")
          .order("name"),
      ])

    if (packageErr) {
      setError(packageErr.message)
      setLoading(false)
      return
    }

    const userId = auth.user?.id
    if (userId) {
      const { data: me } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle()
      setMeRole((me?.role as UserRole | undefined) ?? null)
    } else {
      setMeRole(null)
    }

    setServices(
      (serviceRows ?? []).map((service) => ({
        id: service.id,
        name: service.name,
      })),
    )

    setPackages(
      (packageRows ?? []).map((row) => {
        const relatedService = (row as { services?: { name?: string } | null }).services
        return {
          id: row.id,
          name: row.name,
          serviceId: row.service_id,
          serviceName: relatedService?.name ?? "—",
          sessionCount: row.session_count,
          price: Number(row.price ?? 0),
          validityDays: row.validity_days,
          isActive: row.is_active,
        }
      }),
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadData()
    }, 0)
    return () => window.clearTimeout(id)
  }, [loadData])

  function openCreateModal() {
    setEditing(null)
    setDraft(makeDefaultDraft())
    setModalError(null)
    setIsModalOpen(true)
  }

  function openEditModal(pkg: ServicePackage) {
    setEditing(pkg)
    setDraft({
      name: pkg.name,
      serviceId: pkg.serviceId,
      sessionCount: pkg.sessionCount as 3 | 5 | 10 | 15,
      price: pkg.price,
      validityDays: pkg.validityDays,
      isActive: pkg.isActive ?? true,
    })
    setModalError(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditing(null)
    setModalError(null)
  }

  async function saveTemplate() {
    if (!draft.name.trim() || !draft.serviceId || draft.price <= 0 || draft.validityDays <= 0) {
      setModalError("Please complete all required fields.")
      return
    }

    setSaving(true)
    setModalError(null)
    try {
      const response = editing
        ? await updateServicePackageAction(editing.id, draft)
        : await createServicePackageAction(draft)
      if (!response.ok) throw new Error(response.error)
      closeModal()
      await loadData()
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Failed to save package template.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-3xl font-bold text-[#1f2918]">Packages</h2>
            <p className="mt-1 text-[#6a6358]">
              Manage package templates linked to active services.
            </p>
          </div>
          {canManage ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
            >
              New Package
            </button>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-[#dfd8cf] bg-white p-6 text-sm text-[#6a6358] shadow-sm">
            Loading package templates...
          </div>
        ) : (
          <PackageTable packages={packages} canManage={canManage} onEdit={openEditModal} />
        )}
      </div>

      {isModalOpen && canManage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-[#1f2918]">
                {editing ? "Edit package template" : "Create package template"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded px-2 py-1 text-sm text-[#6a6358] hover:bg-[#F5F0E8]"
              >
                Close
              </button>
            </div>

            {modalError ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </p>
            ) : null}

            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">Package name</span>
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">Service</span>
                <select
                  value={draft.serviceId}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, serviceId: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                >
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#314031]">Session count</span>
                  <select
                    value={draft.sessionCount}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        sessionCount: Number(event.target.value) as 3 | 5 | 10 | 15,
                      }))
                    }
                    className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                  >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#314031]">Price (PHP)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={draft.price}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        price: Number(event.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[#314031]">
                    Validity (days)
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={draft.validityDays}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        validityDays: Number(event.target.value) || 1,
                      }))
                    }
                    className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#314031]">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[#cfc6ba] text-[#6B7A3E]"
                />
                Active for new assignments
              </label>

              {selectedServiceName ? (
                <p className="text-xs text-[#6a6358]">Selected service: {selectedServiceName}</p>
              ) : null}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveTemplate()}
                className="rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageWrapper>
  )
}
