"use client"

import { useMemo, useState } from "react"
import { INVENTORY_ADJUSTMENT_TYPES } from "@/lib/constants"
import { logInventoryAdjustment } from "@/lib/api/inventory-client"
import { useCurrentUser } from "@/lib/auth/current-user"
import type { Product } from "@/types/product"

interface AdjustmentFormProps {
  products: Product[]
  onSuccess: () => void
  productIdPreselected?: string
}

const ADJUSTMENT_ICONS = {
  StockIn: "📦",
  StockOut: "📤",
  Spoilage: "🗑️",
  Damaged: "⚠️",
}

const ADJUSTMENT_LABELS = {
  StockIn: "Stock In",
  StockOut: "Stock Out",
  Spoilage: "Spoilage",
  Damaged: "Damaged",
}

const ADJUSTMENT_PLACEHOLDERS = {
  StockIn: "Delivery from supplier dated...",
  StockOut: "Used in treatments / sold",
  Spoilage: "Found expired on shelf, declared spoilage",
  Damaged: "Broken pump, product leaked",
}

export default function AdjustmentForm({
  products,
  onSuccess,
  productIdPreselected,
}: AdjustmentFormProps) {
  const user = useCurrentUser()
  const [productId, setProductId] = useState(productIdPreselected || "")
  const [type, setType] = useState<"StockIn" | "StockOut" | "Spoilage" | "Damaged">("StockIn")
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId),
    [productId, products],
  )

  const stockAfter = selectedProduct
    ? type === "StockIn"
      ? selectedProduct.stockQuantity + quantity
      : selectedProduct.stockQuantity - quantity
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!productId) {
        setError("Please select a product.")
        return
      }

      if (!selectedProduct) {
        setError("Product not found.")
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

      if (type === "Damaged" && !reason.trim()) {
        setError("Reason is required for damaged items.")
        return
      }

      if (
        (type === "StockOut" || type === "Spoilage" || type === "Damaged") &&
        quantity > selectedProduct.stockQuantity
      ) {
        setError(
          `Insufficient stock. Current: ${selectedProduct.stockQuantity} units, cannot remove ${quantity} units.`,
        )
        return
      }

      if (!user?.userId) {
        setError("User not authenticated.")
        return
      }

      await logInventoryAdjustment(productId, { type, quantity, reason: reason.trim() || undefined }, user.userId)

      // Reset form
      setProductId("")
      setQuantity(1)
      setReason("")
      setType("StockIn")
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log adjustment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Log Stock Adjustment</h3>
        <p className="mt-1 text-sm text-gray-600">
          Record stock movements for products
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* STEP 1: Select Product */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Step 1: Select Product <span className="text-red-500">*</span>
        </label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">-- Choose a product --</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.sku ?? "No SKU"}) · Stock: {product.stockQuantity}
            </option>
          ))}
        </select>
        {selectedProduct && (
          <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm border border-blue-200">
            <p className="font-medium text-blue-900">Current Stock: {selectedProduct.stockQuantity} units</p>
          </div>
        )}
      </div>

      {/* STEP 2: Adjustment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Step 2: Adjustment Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(["StockIn", "StockOut", "Spoilage", "Damaged"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg border-2 p-3 text-center transition-all ${
                type === t
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">{ADJUSTMENT_ICONS[t]}</div>
              <div className="text-xs font-medium text-gray-900">{ADJUSTMENT_LABELS[t]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 3: Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Step 3: Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {selectedProduct && (
          <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm border border-gray-200">
            <p className="text-gray-700">
              <span className="font-medium">After this adjustment:</span>{" "}
              <span className={stockAfter < 0 ? "text-red-600 font-bold" : "text-gray-900 font-bold"}>
                {Math.max(0, stockAfter)} units
              </span>
            </p>
          </div>
        )}
      </div>

      {/* STEP 4: Reason / Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Step 4: Reason / Notes{" "}
          {(type === "Spoilage" || type === "Damaged") && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={ADJUSTMENT_PLACEHOLDERS[type]}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !selectedProduct}
          className="flex-1 rounded-lg bg-green-600 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging..." : "Log Adjustment"}
        </button>
      </div>
    </form>
  )
}
