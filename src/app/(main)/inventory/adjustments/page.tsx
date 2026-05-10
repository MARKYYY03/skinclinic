"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import PageWrapper from "@/components/layout/PageWrapper"
import AdjustmentForm from "@/components/inventory/AdjustmentForm"
import { getProducts } from "@/lib/actions/inventory"
import type { Product } from "@/types/product"

export default function InventoryAdjustmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const preselectedProductId = searchParams.get("productId") || undefined

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      console.error("Failed to load products:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    // Reload products to get updated stock
    loadProducts()
    // Redirect back
    setTimeout(() => {
      router.push("/inventory")
    }, 1000)
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Log Adjustment</h1>
            <p className="mt-1 text-gray-600">Record stock movement for a product</p>
          </div>
          <Link href="/inventory" className="inline-block rounded-md border border-[#6B7A3E] px-4 py-2 text-sm font-medium text-[#6B7A3E] hover:bg-[#6B7A3E] hover:text-white transition-colors">
            ← Back to Inventory
          </Link>
        </div>

        {/* Form */}
        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <AdjustmentForm
            products={products}
            onSuccess={handleSuccess}
            productIdPreselected={preselectedProductId}
          />
        )}
      </div>
    </PageWrapper>
  )
}
