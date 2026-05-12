"use client"

import { useState } from "react"
import { X, AlertCircle, CheckCircle, Eye, EyeOff, Trash2 } from "lucide-react"

import { updateUserByOwnerAction, changeUserPasswordAction, deleteUserAccountAction } from "@/lib/actions/profiles-admin"
import type { User, UserRole } from "@/types/user"

const roleOptions: UserRole[] = ["Owner", "Admin", "Cashier", "Staff"]

interface UserEditModalInnerProps {
  user: User
  currentUserRole: UserRole
  onClose: () => void
  onSaved: () => void | Promise<void>
}

function UserEditModalInner({ user, currentUserRole, onClose, onSaved }: UserEditModalInnerProps) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [isActive, setIsActive] = useState(user.isActive)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const isOwner = currentUserRole === "Owner"

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

  async function handleChangePassword() {
    if (!newPassword.trim()) {
      setError("Please enter a new password.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const r = await changeUserPasswordAction(user.id, newPassword)
      if (!r.ok) throw new Error(r.error)
      setNewPassword("")
      setError(null)
      // Show success
      await new Promise((resolve) => setTimeout(resolve, 500))
      await onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setSaving(true)
    setError(null)
    try {
      const r = await deleteUserAccountAction(user.id)
      if (!r.ok) throw new Error(r.error)
      await onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="w-full max-w-md rounded-xl border border-[#dfd8cf] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
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

          {isOwner ? (
            <>
              <div className="border-t border-[#e5ded4] pt-5">
                <h4 className="text-sm font-semibold text-[#1f2918] mb-3">Change Password</h4>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm text-[#1f2918] focus:ring-2 focus:ring-[#6B7A3E] focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#9a9288] hover:text-[#6a6358]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={saving || !newPassword.trim()}
                    className="rounded-lg bg-[#6B7A3E] px-3 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="border-t border-[#e5ded4] pt-5">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors border border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </div>

              {showDeleteConfirm ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800 mb-3 font-medium">
                    Are you sure you want to delete <strong>{user.name}</strong>'s account? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={saving}
                      className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Deleting..." : "Confirm Delete"}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
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
  currentUserRole: UserRole
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export default function UserEditModal({ user, open, currentUserRole, onClose, onSaved }: UserEditModalProps) {
  if (!open || !user) return null
  return <UserEditModalInner key={user.id} user={user} currentUserRole={currentUserRole} onClose={onClose} onSaved={onSaved} />
}
