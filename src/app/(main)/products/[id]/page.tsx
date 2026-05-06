"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PageWrapper from "@/components/layout/PageWrapper"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Product } from "@/types/product"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabaseClient
        .from("products")
        .select("id, name, sku, selling_price, cost_price, stock_quantity, low_stock_threshold, expiration_date, supplier")
        .eq("id", params.id as string)
        .maybeSingle()
      if (cancelled || !data) return
      setProduct({
        id: data.id,
        name: data.name,
        sku: data.sku ?? undefined,
        sellingPrice: Number(data.selling_price ?? 0),
        costPrice: Number(data.cost_price ?? 0),
        stockQuantity: data.stock_quantity,
        lowStockThreshold: data.low_stock_threshold,
        expirationDate: data.expiration_date ?? undefined,
        supplier: data.supplier ?? undefined,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [params.id])

  if (!product) {
    return (
      <PageWrapper>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Product Details</h2>
          <p className="mt-1 text-gray-600">{product.name}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Selling Price</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(product.sellingPrice)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Cost Price</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(product.costPrice)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Current Stock</p>
            <p
              className={`text-xl font-bold ${
                product.stockQuantity <= product.lowStockThreshold
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {product.stockQuantity}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Expiry Date</p>
            <p className="text-xl font-bold text-gray-900">
              {product.expirationDate ? formatDate(product.expirationDate) : "N/A"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <p className="text-sm text-gray-700">
              <strong>SKU:</strong> {product.sku ?? "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Supplier:</strong> {product.supplier ?? "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Low Stock Threshold:</strong> {product.lowStockThreshold}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Estimated Margin:</strong>{" "}
              {Math.round(
                ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100,
              )}
              %
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
