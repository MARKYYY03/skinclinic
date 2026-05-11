"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import PageWrapper from "@/components/layout/PageWrapper"
import { createServiceAction } from "@/lib/actions/services"
import { useCurrentUser } from "@/lib/auth/current-user"

export default function NewServicePage() {
  const router = useRouter()
  const { role } = useCurrentUser()
  const canManage = role === "Owner" || role === "Admin"

  const [name, setName] = useState("")
  const [category, setCategory] = useState("Facial")
  const [price, setPrice] = useState(0)
  const [commissionRate, setCommissionRate] = useState(0)
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!canManage) {
    return (
      <PageWrapper>
        <p className="text-sm text-[#6a6358]">You do not have access to add services.</p>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <Link
            href="/services"
            className="text-sm font-medium text-[#6B7A3E] hover:text-[#5a6734]"
          >
            ← Back to Services
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-[#1f2918]">Add Service</h2>
          <p className="mt-1 text-sm text-[#5c564c]">
            Create a catalog entry for billing and commissions.
          </p>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault()
            if (!name.trim()) {
              setError("Name is required.")
              return
            }
            setSubmitting(true)
            setError(null)
            try {
              const r = await createServiceAction({
                name: name.trim(),
                description: description.trim() || null,
                category: category.trim() || null,
                price,
                commission_rate: commissionRate,
              })
              if (!r.ok) throw new Error(r.error)
              router.push("/services")
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not save.")
            } finally {
              setSubmitting(false)
            }
          }}
          className="space-y-4 rounded-xl border border-[#dfd8cf] bg-white p-6 shadow-sm"
        >
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#314031]">Service name *</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2"
                placeholder="Hydra facial"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#314031]">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-black"
              >
                <option value="Facial">Facial</option>
                <option value="Peel">Peel</option>
                <option value="Body">Body</option>
                <option value="Spa">Spa</option>
                <option value="Skincare">Skincare</option>
                <option value="Salon">Salon</option>
                <option value="Massage">Massage</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#314031]">Price (₱)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-black"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#314031]">
                Commission rate (%)
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={commissionRate}
                onChange={(event) => setCommissionRate(Number(event.target.value))}
                className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-black"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[#314031]">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-black"
              placeholder="Treatment scope, preparation, aftercare…"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/services")}
              className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save service"}
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  )
}
