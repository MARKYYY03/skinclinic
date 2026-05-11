"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Client } from "@/types/client"

interface ClientFormProps {
  initialData?: Partial<Client>
  onSubmit: (data: Omit<Client, "id" | "createdAt">) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
  cancelHref?: string
  onCancel?: () => void
}

export default function ClientForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Save client",
  cancelHref = "/clients",
  onCancel,
}: ClientFormProps) {
  const router = useRouter()

  const displayEmail =
    initialData?.email && initialData.email !== "—" ? initialData.email : ""

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName ?? "",
    contactNumber: initialData?.contactNumber ?? "",
    email: displayEmail,
    address: initialData?.address ?? "",
    birthdate: initialData?.birthdate ?? "",
    gender: initialData?.gender ?? ("Female" as "Male" | "Female" | "Other"),
    medicalHistory: initialData?.medicalHistory ?? "",
    allergies: initialData?.allergies ?? "",
    notes: initialData?.notes ?? "",
    category:
      initialData?.category ?? ("Regular" as "Regular" | "VIP"),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required."
    }

    if (formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Enter a valid email address."
      }
    }

    if (formData.contactNumber.trim()) {
      const trimmed = formData.contactNumber.trim()
      if (
        trimmed.length > 0 &&
        !/^(\+63|0)?[0-9]{10,11}$/.test(trimmed.replace(/\s+/g, ""))
      ) {
        newErrors.contactNumber = "Enter a valid contact number."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!validateForm()) {
      return
    }

    try {
      const trimmedContact = formData.contactNumber.trim().replace(/\s+/g, "")
      await onSubmit({
        fullName: formData.fullName.trim(),
        contactNumber: trimmedContact,
        email: formData.email.trim(),
        address: formData.address.trim(),
        birthdate: formData.birthdate.trim(),
        gender: formData.gender,
        medicalHistory: formData.medicalHistory.trim(),
        allergies: formData.allergies.trim(),
        notes: formData.notes.trim(),
        category: formData.category,
      })
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong.",
      )
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {formError}
        </div>
      ) : null}

      <div className="rounded-xl border border-[#dfd8cf] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-[#1f2918]">
          Basic information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-[#314031]"
            >
              Full name *
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-black placeholder-gray-400 shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E] focus:border-[#6B7A3E] ${errors.fullName ? "border-red-300" : "border-[#cfc6ba]"}`}
              placeholder="Client full name"
            />
            {errors.fullName ? (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="contactNumber"
              className="block text-sm font-medium text-[#314031]"
            >
              Contact number
            </label>
            <input
              type="tel"
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) =>
                handleInputChange("contactNumber", e.target.value)
              }
              className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-black placeholder-gray-400 shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E] focus:border-[#6B7A3E] ${errors.contactNumber ? "border-red-300" : "border-[#cfc6ba]"}`}
              placeholder="09xx or +63..."
            />
            {errors.contactNumber ? (
              <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#314031]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-black placeholder-gray-400 shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E] focus:border-[#6B7A3E] ${errors.email ? "border-red-300" : "border-[#cfc6ba]"}`}
              placeholder="name@example.com"
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="birthdate"
              className="block text-sm font-medium text-[#314031]"
            >
              Birthdate
            </label>
            <input
              type="date"
              id="birthdate"
              value={formData.birthdate}
              onChange={(e) =>
                handleInputChange("birthdate", e.target.value)
              }
              className="mt-1 block w-full rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E]"
            />
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-[#314031]"
            >
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-black shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E]"
            >
              <option value="Female" className="bg-white text-black">
                Female
              </option>
              <option value="Male" className="bg-white text-black">
                Male
              </option>
              <option value="Other" className="bg-white text-black">
                Other
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-[#314031]"
            >
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                handleInputChange("category", e.target.value)
              }
              className="mt-1 block w-full rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-black shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E]"
            >
              <option value="Regular" className="bg-white text-gray-900">
                Regular
              </option>
              <option value="VIP" className="bg-white text-gray-900">
                VIP
              </option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-[#314031]"
          >
            Address
          </label>
          <textarea
            id="address"
            rows={3}
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="mt-1 block w-full rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-black shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#dfd8cf] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-[#1f2918]">
          Clinical notes
        </h3>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="medicalHistory"
              className="block text-sm font-medium text-[#314031]"
            >
              Medical history
            </label>
            <textarea
              id="medicalHistory"
              rows={3}
              value={formData.medicalHistory}
              onChange={(e) =>
                handleInputChange("medicalHistory", e.target.value)
              }
              className="mt-1 block w-full rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-black shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E]"
            />
          </div>

          <div>
            <label
              htmlFor="allergies"
              className="block text-sm font-medium text-[#314031]"
            >
              Allergies
            </label>
            <textarea
              id="allergies"
              rows={2}
              value={formData.allergies}
              onChange={(e) => handleInputChange("allergies", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-black shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E]"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-[#314031]"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-black shadow-sm outline-none focus:ring-1 focus:ring-[#6B7A3E]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 rounded-xl border border-[#dfd8cf] bg-white px-6 py-4 shadow-sm">
        <button
          type="button"
          onClick={() => {
            if (onCancel) onCancel()
            else router.push(cancelHref)
          }}
          className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  )
}
