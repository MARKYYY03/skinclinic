"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ServicePackage } from "@/types/package"

interface PackageFormProps {
  mode: "create" | "edit"
  initialData?: ServicePackage
  onSubmit?: (data: ServicePackage) => void
}

export default function PackageForm({ mode, initialData, onSubmit }: PackageFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name ?? "")
  const [serviceId, setServiceId] = useState(initialData?.serviceId ?? "")
  const [sessionCount, setSessionCount] = useState(initialData?.sessionCount ?? 5)
  const [price, setPrice] = useState(initialData?.price ?? 0)
  const [validityDays, setValidityDays] = useState(initialData?.validityDays ?? 365)
  const [error, setError] = useState("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !serviceId.trim() || price <= 0) {
      setError("Please complete all required fields.")
      return
    }

    const payload: ServicePackage = {
      id: initialData?.id ?? `pkg-${Date.now()}`,
      name: name.trim(),
      serviceId: serviceId.trim(),
      sessionCount,
      price,
      validityDays,
    }

    onSubmit?.(payload)
    router.push("/packages")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-5 shadow">
      <h3 className="text-lg font-semibold text-gray-900">
        {mode === "create" ? "Create Package Template" : "Edit Package Template"}
      </h3>

      <label className="block text-sm">
        <span className="mb-1 block text-gray-700">Package Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Hydra Facial 5 Sessions"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-gray-700">Service ID</span>
        <input
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="s-001"
        />
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Sessions</span>
          <input
            type="number"
            min={1}
            value={sessionCount}
            onChange={(event) => setSessionCount(Number(event.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Price</span>
          <input
            type="number"
            min={1}
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </label>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Validity Days</span>
          <input
            type="number"
            min={1}
            value={validityDays}
            onChange={(event) => setValidityDays(Number(event.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/packages")}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Save Package
        </button>
      </div>
    </form>
  )
}
