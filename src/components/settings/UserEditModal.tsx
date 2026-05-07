"use client"

import { useState } from "react"

import { updateUserByOwnerAction } from "@/lib/actions/profiles-admin"
import type { User, UserRole } from "@/types/user"

const roleOptions: UserRole[] = ["Owner", "Admin", "Cashier", "Staff"]

interface UserEditModalInnerProps {
  user: User
  onClose: () => void
  onSaved: () => void | Promise<void>
}

function UserEditModalInner({ user, onClose, onSaved }: UserEditModalInnerProps) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [isActive, setIsActive] = useState(user.isActive)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const r = await updateUserByOwnerAction(user.id, { role, is_active: isActive })
      if (!r.ok) throw new Error(r.error)
      await onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="w-full max-w-md rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-[#1f2918]">Edit user</h3>
            <p className="text-sm text-[#6a6358]">{user.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-[#6a6358] hover:bg-[#F5F0E8]"
          >
            Close
          </button>
        </div>

        {error ? (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-medium text-[#314031]">Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
            aria-label="User role"
          >
            {roleOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="mb-5 flex cursor-pointer items-center gap-2 text-sm font-medium text-[#314031]">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-[#cfc6ba] text-[#6B7A3E]"
          />
          Account active
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}

interface UserEditModalProps {
  user: User | null
  open: boolean
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export default function UserEditModal({ user, open, onClose, onSaved }: UserEditModalProps) {
  if (!open || !user) return null
  return <UserEditModalInner key={user.id} user={user} onClose={onClose} onSaved={onSaved} />
}
