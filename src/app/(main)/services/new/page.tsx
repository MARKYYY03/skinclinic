"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PageWrapper from "@/components/layout/PageWrapper"

export default function NewServicePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [category, setCategory] = useState("Facial")
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [price, setPrice] = useState(0)
  const [description, setDescription] = useState("")

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Add Service</h2>
          <p className="mt-1 text-gray-600">Create a detailed service entry for your catalog.</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            router.push("/services")
          }}
          className="space-y-4 rounded-lg bg-white p-5 shadow"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Service Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Hydra Facial"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="Facial">Facial</option>
                <option value="Peel">Peel</option>
                <option value="Body">Body</option>
                <option value="Spa">Spa</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Duration (minutes)</span>
              <input
                type="number"
                min={15}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Price</span>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className="w-full rounded border border-gray-300 px-3 py-2"
                required
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-700">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Treatment scope, preparation, and aftercare notes."
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/services")}
              className="rounded border border-gray-300 px-4 py-2 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Save Service
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  )
}
