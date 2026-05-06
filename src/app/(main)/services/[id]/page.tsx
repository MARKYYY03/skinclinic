"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import PageWrapper from "@/components/layout/PageWrapper"
import { supabaseClient } from "@/lib/supabase/supabase-client"

type ServiceRow = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  commission_rate: number | null
  is_active: boolean
}

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState<ServiceRow | null>(null)

  useEffect(() => {
    let cancelled = false
    const tid = window.setTimeout(() => {
      void (async () => {
        const { data } = await supabaseClient
          .from("services")
          .select("id, name, description, category, price, commission_rate, is_active")
          .eq("id", params.id as string)
          .maybeSingle()
        if (!cancelled) setService((data as ServiceRow | null) ?? null)
      })()
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(tid)
    }
  }, [params.id])

  if (!service) {
    return (
      <PageWrapper>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">Service not found</h2>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Service</h2>
          <p className="mt-1 text-gray-600">
            Update details for <strong>{service.name}</strong>. Use the Services list for full
            editing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Category</p>
            <p className="text-lg font-semibold text-gray-900">{service.category}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-lg font-semibold text-gray-900">
              ₱{Number(service.price).toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Status</p>
            <button
              type="button"
              onClick={async () => {
                const next = !service.is_active
                setService({ ...service, is_active: next })
                await supabaseClient
                  .from("services")
                  .update({ is_active: next })
                  .eq("id", service.id)
              }}
              className={`mt-1 rounded px-3 py-1 text-sm font-medium ${
                service.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {service.is_active ? "Active" : "Inactive"}
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
