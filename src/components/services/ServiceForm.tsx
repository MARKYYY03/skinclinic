"use client"

import { useState } from "react"
import type { ServiceListRow } from "@/types/service"
import {
  updateServiceAction,
  type ServiceUpdatePayload,
} from "@/lib/actions/services"

interface ServiceFormProps {
  initialData: ServiceListRow
  onSuccess: () => Promise<void> | void
  onCancel: () => void
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

export default function ServiceForm({
  initialData,
  onSuccess,
  onCancel,
}: ServiceFormProps) {
  const [draft, setDraft] = useState<ServiceUpdatePayload>(
    emptyPayloadFrom(initialData)
  )
  const [modalError, setModalError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setModalError(null)
    setSaving(true)
    try {
      const r = await updateServiceAction(initialData.id, draft)
      if (!r.ok) throw new Error(r.error)
      onSuccess()
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Save failed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        void handleSave()
      }}
    >
      {modalError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
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
            required
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
            className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm text-black"
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
            className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm text-black"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-[#314031]">
            Price (₱)
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={draft.price}
            onChange={(e) =>
              setDraft({ ...draft, price: Number(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm text-black"
            required
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
            className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm text-black"
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

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || !draft.name.trim()}
          className="rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  )
}
