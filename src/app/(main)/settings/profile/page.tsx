"use client"

import { useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { useCurrentUser } from "@/lib/auth/current-user"
import { User, Lock, Camera, CheckCircle, AlertCircle } from "lucide-react"
import ImageModal from "@/components/ImageModal"

export default function ProfileSettingsPage() {
  const { userId, fullName, role } = useCurrentUser()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [photoMessage, setPhotoMessage] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

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
      if (!userId) return
      try {
        // Load photo from localStorage
        const savedPhoto = localStorage.getItem(`avatar_${userId}`)
        if (savedPhoto && !cancelled) {
          setPhotoUrl(savedPhoto)
        }
      } catch (error) {
        console.log("Could not load photo:", error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fullName, userId])

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please upload an image file.")
      return
    }

    // Validate file size (max 2MB because the photo is stored in browser localStorage)
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("File size must be less than 2MB.")
      return
    }

    // Show preview and save locally
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (!userId) {
        setPhotoError("Unable to save photo. Please sign in again and try once more.")
        return
      }

      try {
        localStorage.setItem(`avatar_${userId}`, result)
        setPhotoPreview(result)
        setPhotoUrl(result)
        setPhotoMessage("Photo uploaded successfully!")
        setTimeout(() => setPhotoMessage(null), 4000)
      } catch (error) {
        console.error("Failed to save avatar to localStorage", error)
        setPhotoError("Unable to save the photo locally. Try a smaller image under 2MB.")
      }
    }
    reader.readAsDataURL(file)

    setPhotoError(null)
    setPhotoPreview(null)
    event.target.value = ""
  }

  async function removePhoto() {
    try {
      localStorage.removeItem(`avatar_${userId}`)
      setPhotoUrl(null)
      setPhotoMessage("Photo removed successfully!")
      setTimeout(() => setPhotoMessage(null), 4000)
    } catch (error) {
      setPhotoError("Failed to remove photo.")
    }
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    setProfileError(null)
    setProfileMessage(null)
    
    if (!firstName.trim() || !lastName.trim()) {
      setProfileError("First name and last name are required.")
      return
    }

    const mergedName = `${firstName.trim()} ${lastName.trim()}`.trim()

    setSavingProfile(true)
    const { error } = await supabaseClient
      .from("profiles")
      .update({ full_name: mergedName })
      .eq("id", userId)
    setSavingProfile(false)

    if (error) {
      setProfileError(error.message)
      return
    }

    setProfileMessage("Profile updated successfully.")
    setTimeout(() => setProfileMessage(null), 4000)
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)
    
    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in both password fields.")
      return
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }

    setSavingPassword(true)
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      setPasswordError(error.message)
      return
    }

    setNewPassword("")
    setConfirmPassword("")
    setPasswordMessage("Password changed successfully.")
    setTimeout(() => setPasswordMessage(null), 4000)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#e5ded4] pb-6">
        <h1 className="text-3xl font-bold text-[#1f2918]">My Profile</h1>
        <p className="mt-2 text-sm text-[#6a6358]">
          Manage your account information and security settings.
        </p>
      </div>

      {/* Photo Upload Card */}
      <div className="overflow-hidden rounded-3xl border border-[#dfd8cf] bg-white shadow-sm">
        <div className="border-b border-[#e5ded4] bg-[#faf7f0] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#e8e0d4] p-3">
              <Camera className="h-5 w-5 text-[#6B7A3E]" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6b7a3e]">
                Profile Photo
              </p>
              <p className="text-xs text-[#6a6358] mt-0.5">Upload or change your profile picture</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Status Messages */}
          {photoError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{photoError}</p>
            </div>
          )}
          {photoMessage && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">{photoMessage}</p>
            </div>
          )}

          {/* Photo Preview and Upload */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Photo Display */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {photoPreview || photoUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    aria-label="View your profile photo"
                  >
                    <img
                      src={photoPreview || photoUrl}
                      alt="Profile"
                      className="h-32 w-32 rounded-2xl object-cover border-4 border-[#e5ded4]"
                    />
                  </button>
                ) : (
                  <div className="h-32 w-32 rounded-2xl bg-[#f5f0e8] border-4 border-[#e5ded4] flex items-center justify-center">
                    <User className="h-12 w-12 text-[#c4b9ad]" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 rounded-full bg-[#6B7A3E] p-2">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
              {photoPreview && <p className="text-xs text-[#9a9288]">Preview</p>}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-[#314031] mb-3">
                  Upload New Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="block w-full text-sm text-[#6a6358] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f5f0e8] file:text-[#6B7A3E] hover:file:bg-[#e8e0d4] file:cursor-pointer file:disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="text-xs text-[#9a9288] mt-2">
                  JPG, PNG, GIF or WebP • Max 2MB
                </p>
              </div>

              {photoUrl && (
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={uploadingPhoto}
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-[#dfd8cf] bg-white shadow-sm">
        <div className="border-b border-[#e5ded4] bg-[#faf7f0] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#e8e0d4] p-3">
              <User className="h-5 w-5 text-[#6B7A3E]" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6b7a3e]">
                Profile Information
              </p>
              <p className="text-xs text-[#6a6358] mt-0.5">Update your name and view your role</p>
            </div>
          </div>
        </div>

        <form onSubmit={saveProfile} className="p-6 space-y-4">
          {/* Status Messages */}
          {profileError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{profileError}</p>
            </div>
          )}
          {profileMessage && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">{profileMessage}</p>
            </div>
          )}

          {/* Input Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#314031]">First Name</label>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Enter your first name"
                className="w-full rounded-lg border border-[#cfc6ba] bg-white px-4 py-2.5 text-sm text-[#1f2918] placeholder-[#9a9288] focus:border-[#6B7A3E] focus:ring-2 focus:ring-[#6B7A3E]/20 focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#314031]">Last Name</label>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Enter your last name"
                className="w-full rounded-lg border border-[#cfc6ba] bg-white px-4 py-2.5 text-sm text-[#1f2918] placeholder-[#9a9288] focus:border-[#6B7A3E] focus:ring-2 focus:ring-[#6B7A3E]/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#314031] mb-2">Role</label>
            <input
              value={role}
              readOnly
              className="w-full rounded-lg border border-[#e5ded4] bg-[#f5f0e8] px-4 py-2.5 text-sm text-[#6a6358] font-medium cursor-not-allowed"
              title="Your role is assigned by the account owner"
            />
            <p className="text-xs text-[#9a9288] mt-2">Your role is assigned by the account owner</p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-[#6B7A3E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5a6734] disabled:bg-[#9a9288] disabled:cursor-not-allowed transition-colors"
            >
              {savingProfile ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Image Modal */}
      {(photoPreview || photoUrl) && (
        <ImageModal
          isOpen={showImageModal}
          imageUrl={photoPreview || photoUrl}
          userName={fullName}
          onClose={() => setShowImageModal(false)}
        />
      )}

      {/* Password Change Card */}
      <div className="overflow-hidden rounded-3xl border border-[#dfd8cf] bg-white shadow-sm">
        <div className="border-b border-[#e5ded4] bg-[#faf7f0] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#e8e0d4] p-3">
              <Lock className="h-5 w-5 text-[#6B7A3E]" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6b7a3e]">
                Change Password
              </p>
              <p className="text-xs text-[#6a6358] mt-0.5">Update your login password</p>
            </div>
          </div>
        </div>

        <form onSubmit={changePassword} className="p-6 space-y-4">
          {/* Status Messages */}
          {passwordError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}
          {passwordMessage && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">{passwordMessage}</p>
            </div>
          )}

          {/* Input Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#314031]">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-lg border border-[#cfc6ba] bg-white px-4 py-2.5 text-sm text-[#1f2918] placeholder-[#9a9288] focus:border-[#6B7A3E] focus:ring-2 focus:ring-[#6B7A3E]/20 focus:outline-none transition-all"
              />
              <p className="text-xs text-[#9a9288]">Minimum 6 characters</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#314031]">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-[#cfc6ba] bg-white px-4 py-2.5 text-sm text-[#1f2918] placeholder-[#9a9288] focus:border-[#6B7A3E] focus:ring-2 focus:ring-[#6B7A3E]/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Update Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-[#6B7A3E] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5a6734] disabled:bg-[#9a9288] disabled:cursor-not-allowed transition-colors"
            >
              {savingPassword ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

