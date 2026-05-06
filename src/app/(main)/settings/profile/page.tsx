"use client"

import { useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { useCurrentUser } from "@/lib/auth/current-user"

export default function ProfileSettingsPage() {
  const { userId, fullName, role } = useCurrentUser()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    function splitName(value: string) {
      const normalized = value.trim().replace(/\s+/g, " ")
      if (!normalized) return { first: "", last: "" }
      const parts = normalized.split(" ")
      if (parts.length === 1) return { first: parts[0], last: "" }
      return { first: parts[0], last: parts.slice(1).join(" ") }
    }

    const current = splitName(fullName)
    setFirstName(current.first)
    setLastName(current.last)

    ;(async () => {
      const { data } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle()

      if (!cancelled && data?.full_name) {
        const loaded = splitName(data.full_name)
        setFirstName(loaded.first)
        setLastName(loaded.last)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fullName, userId])

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      setProfileMessage("First name and last name are required.")
      return
    }

    const mergedName = `${firstName.trim()} ${lastName.trim()}`.trim()

    setSavingProfile(true)
    setProfileMessage(null)
    const { error } = await supabaseClient
      .from("profiles")
      .update({ full_name: mergedName })
      .eq("id", userId)
    setSavingProfile(false)

    if (error) {
      setProfileMessage(error.message)
      return
    }

    setProfileMessage("Profile updated successfully.")
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault()
    if (!newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in both password fields.")
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match.")
      return
    }

    setSavingPassword(true)
    setPasswordMessage(null)
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      setPasswordMessage(error.message)
      return
    }

    setNewPassword("")
    setConfirmPassword("")
    setPasswordMessage("Password changed successfully.")
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveProfile} className="space-y-3 rounded-lg bg-white p-5 shadow">
        <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="First name"
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Last name"
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            value={role}
            readOnly
            title="Current role"
            aria-label="Current role"
            className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
          />
        </div>
        {profileMessage ? <p className="text-sm text-gray-700">{profileMessage}</p> : null}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      <form onSubmit={changePassword} className="space-y-3 rounded-lg bg-white p-5 shadow">
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        {passwordMessage ? <p className="text-sm text-gray-700">{passwordMessage}</p> : null}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  )
}

