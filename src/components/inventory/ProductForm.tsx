"use client"

import { useState } from "react"
import { createProduct, updateProduct } from "@/lib/api/inventory-client"
import type { Product } from "@/types/product"

interface ProductFormProps {
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "")
  const [sku, setSku] = useState(product?.sku ?? "")
  const [description, setDescription] = useState("")
  const [sellingPrice, setSellingPrice] = useState(product?.sellingPrice ?? 0)
  const [costPrice, setCostPrice] = useState(product?.costPrice ?? 0)
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity ?? 0)
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold ?? 5)
  const [expirationDate, setExpirationDate] = useState(product?.expirationDate ?? "")
  const [supplier, setSupplier] = useState(product?.supplier ?? "")
  const [commissionRate, setCommissionRate] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isEditing = !!product

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!name.trim()) {
        setError("Product name is required")
        return
      }

      if (sellingPrice <= 0 || costPrice <= 0) {
        setError("Prices must be greater than zero")
        return
      }

      if (isEditing) {
        await updateProduct(product.id, {
          name,
          sku: sku || undefined,
          sellingPrice,
          costPrice,
          lowStockThreshold,
          expirationDate: expirationDate || undefined,
          supplier: supplier || undefined,
        })
      } else {
        await createProduct({
          name,
          sku: sku || undefined,
          description: description || undefined,
          sellingPrice,
          costPrice,
          stockQuantity,
          lowStockThreshold,
          expirationDate: expirationDate || undefined,
          supplier: supplier || undefined,
          commissionRate,
          isActive,
        })
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name{" "}
            <span className="text-red-400" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
            placeholder="e.g., Facial Serum"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            SKU{" "}
            {!isEditing && (
              <span className="text-xs text-gray-500 font-normal">
                (auto-generated if blank)
              </span>
            )}
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
            placeholder="e.g., SKU-001"
          />
        </div>

        {/* Description */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
              placeholder="Optional description"
              rows={2}
            />
          </div>
        )}

        {/* Selling Price & Cost Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Selling Price ₱{" "}
              <span className="text-red-400" aria-hidden="true">
                *
              </span>
            </label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost Price ₱{" "}
              <span className="text-red-400" aria-hidden="true">
                *
              </span>
            </label>
            <input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        {/* Stock Quantity & Low Stock Threshold */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
                placeholder="5"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Expiration Date & Supplier */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
              placeholder="e.g., Beauty Supply Co"
            />
          </div>
        </div>

        {/* Is Active Toggle */}
        {!isEditing && (
          <div className="pt-1">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Product is active
              </label>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex-1 rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a6e35] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6B7A3E] focus:ring-offset-2 focus:ring-offset-white"
          >
            {loading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
