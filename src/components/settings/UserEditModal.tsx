"use client"

import { useState } from "react"
import { X, AlertCircle, CheckCircle } from "lucide-react"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="w-full max-w-md rounded-xl border border-[#dfd8cf] bg-white p-6 shadow-xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#1f2918]">Edit User</h3>
            <p className="text-sm text-[#6a6358] mt-1 font-medium">{user.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit user dialog"
            className="rounded-lg p-2 text-[#6a6358] hover:bg-[#F5F0E8] transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : null}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#314031] mb-2">Role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm text-[#1f2918] focus:ring-2 focus:ring-[#6B7A3E] focus:border-transparent outline-none transition-all"
              aria-label="User role"
            >
              {roleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 p-3 rounded-lg border border-[#e5ded4] hover:bg-[#F5F0E8] transition-colors">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded accent-[#6B7A3E]"
            />
            <span className="text-sm font-medium text-[#314031]">
              {isActive ? "✓ Account is Active" : "Account is Inactive"}
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
                Saving…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Save Changes
              </>
            )}
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
