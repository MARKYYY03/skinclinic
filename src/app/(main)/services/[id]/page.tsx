"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PageWrapper from "@/components/layout/PageWrapper"
import { mockServices } from "@/lib/mock/catalog"

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const service = useMemo(
    () => mockServices.find((item) => item.id === params.id) ?? mockServices[0],
    [params.id],
  )

  const [isActive, setIsActive] = useState(service.isActive)

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Service</h2>
          <p className="mt-1 text-gray-600">
            Update details for <strong>{service.name}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Category</p>
            <p className="text-lg font-semibold text-gray-900">{service.category}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-lg font-semibold text-gray-900">{service.durationMinutes} min</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Status</p>
            <button
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className={`mt-1 rounded px-3 py-1 text-sm font-medium ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm text-gray-700">{service.description}</p>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/services")}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
