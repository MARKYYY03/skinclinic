"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Client } from "@/types/client"

interface ClientFormProps {
  initialData?: Partial<Client>
  onSubmit: (data: Omit<Client, "id" | "createdAt">) => Promise<void>
  isLoading?: boolean
}

export default function ClientForm({ initialData, onSubmit, isLoading = false }: ClientFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    contactNumber: initialData?.contactNumber || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    birthdate: initialData?.birthdate || "",
    gender: initialData?.gender || "Female" as "Male" | "Female" | "Other",
    medicalHistory: initialData?.medicalHistory || "",
    allergies: initialData?.allergies || "",
    notes: initialData?.notes || "",
    category: initialData?.category || "Regular" as "Regular" | "VIP"
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required"
    } else if (!/^(\+63|0)[0-9]{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid Philippine phone number"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "Birthdate is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      router.push("/clients")
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.fullName ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
              Contact Number *
            </label>
            <input
              type="tel"
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange("contactNumber", e.target.value)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.contactNumber ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="+639123456789 or 09123456789"
            />
            {errors.contactNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.email ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="client@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
              Birthdate *
            </label>
            <input
              type="date"
              id="birthdate"
              value={formData.birthdate}
              onChange={(e) => handleInputChange("birthdate", e.target.value)}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.birthdate ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.birthdate && (
              <p className="mt-1 text-sm text-red-600">{errors.birthdate}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            rows={3}
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter complete address"
          />
        </div>
      </div>

      {/* Medical Information */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Medical Information</h3>
        <div className="space-y-6">
          <div>
            <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
              Medical History
            </label>
            <textarea
              id="medicalHistory"
              rows={3}
              value={formData.medicalHistory}
              onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="List any medical conditions, surgeries, or ongoing treatments"
            />
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
              Allergies
            </label>
            <textarea
              id="allergies"
              rows={2}
              value={formData.allergies}
              onChange={(e) => handleInputChange("allergies", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="List any known allergies (medications, products, etc.)"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Any additional notes or preferences"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 rounded-lg bg-white px-6 py-4 shadow">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Save Client"}
        </button>
      </div>
    </form>
  )
}
