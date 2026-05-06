"use client"

import { useState } from "react"

import {
  setServiceActiveAction,
  updateServiceAction,
  type ServiceUpdatePayload,
} from "@/lib/actions/services"
import type { ServiceListRow } from "@/types/service"
import { formatCurrency } from "@/lib/utils"

interface ServiceTableProps {
  services: ServiceListRow[]
  canManage: boolean
  onChanged: () => void | Promise<void>
}

function emptyPayloadFrom(row: ServiceListRow): ServiceUpdatePayload {
  return {
    name: row.name,
    description: row.description,
    category: row.category,
    price: Number(row.price ?? 0),
    commission_rate: Number(row.commission_rate ?? 0),
    is_active: row.is_active,
  }
}

export default function ServiceTable({
  services,
  canManage,
  onChanged,
}: ServiceTableProps) {
  const [editing, setEditing] = useState<ServiceListRow | null>(null)
  const [draft, setDraft] = useState<ServiceUpdatePayload | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function openEdit(row: ServiceListRow) {
    setModalError(null)
    setEditing(row)
    setDraft(emptyPayloadFrom(row))
  }

  function closeModal() {
    setEditing(null)
    setDraft(null)
    setModalError(null)
  }

  async function saveModal() {
    if (!editing || !draft) return
    setSaving(true)
    setModalError(null)
    try {
      const r = await updateServiceAction(editing.id, draft)
      if (!r.ok) throw new Error(r.error)
      closeModal()
      await onChanged()
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Save failed.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(row: ServiceListRow, next: boolean) {
    setTogglingId(row.id)
    try {
      const r = await setServiceActiveAction(row.id, next)
      if (!r.ok) throw new Error(r.error)
      await onChanged()
    } catch {
      /* surface via toast optional */
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
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
            {services.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-[#6a6358]"
                >
                  No services yet. Add one to build your catalog.
                </td>
              </tr>
            ) : (
              services.map((row) => (
                <tr key={row.id} className="hover:bg-[#F5F0E8]/40">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#1f2918]">{row.name}</p>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          row.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[#e8e3dc] text-[#5c564c]"
                        }`}
                      >
                        {row.is_active ? "Active" : "Inactive"}
                      </span>
                      {canManage ? (
                        <button
                          type="button"
                          disabled={togglingId === row.id}
                          onClick={() => void toggleActive(row, !row.is_active)}
                          className="text-xs font-semibold text-[#6B7A3E] underline-offset-2 hover:underline disabled:opacity-50"
                        >
                          {row.is_active ? "Deactivate" : "Activate"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canManage ? (
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
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

      {editing && draft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-[#1f2918]">Edit service</h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded px-2 py-1 text-sm text-[#6a6358] hover:bg-[#F5F0E8]"
              >
                Close
              </button>
            </div>

            {modalError ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {modalError}
              </p>
            ) : null}

            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">Name</span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">
                  Description
                </span>
                <textarea
                  value={draft.description ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      description: e.target.value.length ? e.target.value : null,
                    })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">Category</span>
                <input
                  value={draft.category ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      category: e.target.value.trim() ? e.target.value : null,
                    })
                  }
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">Price (₱)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={draft.price}
                  onChange={(e) =>
                    setDraft({ ...draft, price: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">
                  Commission rate (%)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={draft.commission_rate}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      commission_rate: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#314031]">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) =>
                    setDraft({ ...draft, is_active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#cfc6ba] text-[#6B7A3E]"
                />
                Active (available for new transactions)
              </label>
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
                disabled={saving || !draft.name.trim()}
                onClick={() => void saveModal()}
                className="rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
