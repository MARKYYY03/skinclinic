"use client"

import { useEffect, useMemo, useState } from "react"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { useCurrentUser } from "@/lib/auth/current-user"

type ServiceRow = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  commission_rate: number | null
  is_active: boolean
}

export default function ServicesSettingsPage() {
  const { role } = useCurrentUser()
  const canManage = useMemo(() => role === "Owner" || role === "Admin", [role])

  const [rows, setRows] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [commissionRate, setCommissionRate] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabaseClient
      .from("services")
      .select("id, name, description, category, price, commission_rate, is_active")
      .order("created_at", { ascending: false })
    if (error) {
      setError(error.message)
      setRows([])
    } else {
      setRows((data ?? []) as ServiceRow[])
    }
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabaseClient
        .from("services")
        .select("id, name, description, category, price, commission_rate, is_active")
        .order("created_at", { ascending: false })

      if (cancelled) return

      if (error) {
        setError(error.message)
        setRows([])
        setLoading(false)
        return
      }

      setRows((data ?? []) as ServiceRow[])
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  async function createService(e: React.FormEvent) {
    e.preventDefault()
    if (!canManage || creating) return
    if (!name.trim()) {
      setError("Service name is required.")
      return
    }

    setCreating(true)
    setError(null)

    const parsedPrice = Number(price || "0")
    const parsedRate = commissionRate.trim() ? Number(commissionRate) : null

    const { error } = await supabaseClient.from("services").insert({
      name: name.trim(),
      category: category.trim() || null,
      description: description.trim() || null,
      price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      commission_rate: parsedRate !== null && Number.isFinite(parsedRate) ? parsedRate : null,
      is_active: true,
    })

    if (error) {
      setError(error.message)
      setCreating(false)
      return
    }

    setName("")
    setCategory("")
    setPrice("")
    setCommissionRate("")
    setDescription("")
    setCreating(false)
    await load()
  }

  async function toggleActive(id: string, next: boolean) {
    if (!canManage) return
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: next } : r)))
    const { error } = await supabaseClient.from("services").update({ is_active: next }).eq("id", id)
    if (error) {
      setError(error.message)
      await load()
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createService} className="space-y-3 rounded-lg bg-white p-5 shadow">
        <h3 className="text-lg font-semibold text-gray-900">Add Service</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Service name"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            disabled={!canManage}
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional)"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            disabled={!canManage}
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            inputMode="decimal"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            disabled={!canManage}
          />
          <input
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            placeholder="Commission % (optional)"
            inputMode="decimal"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            disabled={!canManage}
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="min-h-[80px] w-full rounded border border-gray-300 px-3 py-2 text-sm"
          disabled={!canManage}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canManage || creating}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Saving…" : "Save"}
          </button>
        </div>
        {!canManage ? (
          <p className="text-xs text-gray-500">Only Admin/Owner can manage services.</p>
        ) : null}
      </form>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900">Services</h3>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading services…</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Commission %
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.category ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">₱{Number(r.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.commission_rate ?? 0}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {canManage ? (
                      <button
                        onClick={() => void toggleActive(r.id, !r.is_active)}
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          r.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {r.is_active ? "Active" : "Inactive"}
                      </button>
                    ) : (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          r.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
