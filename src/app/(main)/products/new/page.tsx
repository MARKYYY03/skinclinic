"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PageWrapper from "@/components/layout/PageWrapper"
import { useCurrentUser } from "@/lib/auth/current-user"

export default function NewProductPage() {
  const router = useRouter()
  const { role } = useCurrentUser()
  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [supplier, setSupplier] = useState("")
  const [sellingPrice, setSellingPrice] = useState(0)
  const [costPrice, setCostPrice] = useState(0)
  const [stockQuantity, setStockQuantity] = useState(0)
  const [lowStockThreshold, setLowStockThreshold] = useState(5)
  const [expirationDate, setExpirationDate] = useState("")

  useEffect(() => {
    if (role !== "Owner" && role !== "Admin") {
      router.replace("/products")
    }
  }, [role, router])

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Add Product</h2>
          <p className="mt-1 text-gray-600">Create a detailed inventory product profile.</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            router.push("/products")
          }}
          className="space-y-4 rounded-lg bg-white p-5 shadow"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Product name"
              className="rounded border border-gray-300 px-3 py-2"
              required
            />
            <input
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="SKU"
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
              placeholder="Supplier"
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="date"
              value={expirationDate}
              onChange={(event) => setExpirationDate(event.target.value)}
              className="rounded border border-gray-300 px-3 py-2"
              aria-label="Product expiration date"
              title="Expiration date"
            />
            <input
              type="number"
              min={1}
              value={sellingPrice}
              onChange={(event) => setSellingPrice(Number(event.target.value))}
              placeholder="Selling price"
              className="rounded border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="number"
              min={1}
              value={costPrice}
              onChange={(event) => setCostPrice(Number(event.target.value))}
              placeholder="Cost price"
              className="rounded border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="number"
              min={0}
              value={stockQuantity}
              onChange={(event) => setStockQuantity(Number(event.target.value))}
              placeholder="Initial stock quantity"
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="number"
              min={0}
              value={lowStockThreshold}
              onChange={(event) => setLowStockThreshold(Number(event.target.value))}
              placeholder="Low stock threshold"
              className="rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="rounded bg-gray-50 p-3 text-sm text-gray-700">
            <p>
              Margin preview:{" "}
              <strong>
                {sellingPrice > 0 && costPrice > 0
                  ? `${Math.round(((sellingPrice - costPrice) / sellingPrice) * 100)}%`
                  : "N/A"}
              </strong>
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="rounded border border-gray-300 px-4 py-2 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  )
}
