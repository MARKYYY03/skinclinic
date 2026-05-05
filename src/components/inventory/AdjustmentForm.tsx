"use client"

import { useMemo, useState } from "react"
import { INVENTORY_ADJUSTMENT_TYPES } from "@/lib/constants"
import { Product } from "@/types/product"
import { InventoryLog } from "@/types/inventory"

interface AdjustmentFormProps {
  products: Product[]
  onSubmit: (entry: Omit<InventoryLog, "id" | "date" | "recordedBy">) => void
}

export default function AdjustmentForm({ products, onSubmit }: AdjustmentFormProps) {
  const [productId, setProductId] = useState("")
  const [type, setType] = useState<(typeof INVENTORY_ADJUSTMENT_TYPES)[number]>("StockIn")
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [productId, products],
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!productId) {
      setError("Please select a product.")
      return
    }
    if (quantity <= 0) {
      setError("Quantity must be greater than zero.")
      return
    }
    if (type === "Spoilage" && !reason.trim()) {
      setError("Reason is required for spoilage entries.")
      return
    }
    if (
      selectedProduct &&
      (type === "StockOut" || type === "Spoilage" || type === "Damaged") &&
      quantity > selectedProduct.stockQuantity
    ) {
      setError("Adjustment quantity cannot exceed current stock.")
      return
    }

    onSubmit({
      productId,
      type,
      quantity,
      reason: reason.trim() || undefined,
    })

    setError("")
    setQuantity(1)
    setReason("")
    setType("StockIn")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-5 shadow">
      <h3 className="text-lg font-semibold text-gray-900">Stock Adjustment</h3>

      <label className="block text-sm">
        <span className="mb-1 block text-gray-700">Product</span>
        <select
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Select product for adjustment"
          title="Product selector"
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} (Current: {product.stockQuantity})
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Adjustment Type</span>
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as (typeof INVENTORY_ADJUSTMENT_TYPES)[number])
            }
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Select adjustment type"
            title="Adjustment type selector"
          >
            {INVENTORY_ADJUSTMENT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Quantity</span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Input adjustment quantity"
            title="Adjustment quantity"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-gray-700">
          Reason {type === "Spoilage" ? "(required for spoilage)" : "(optional)"}
        </span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter reason"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Save Adjustment
        </button>
      </div>
    </form>
  )
}
