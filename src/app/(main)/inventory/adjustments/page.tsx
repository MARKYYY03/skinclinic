"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import AdjustmentForm from "@/components/inventory/AdjustmentForm"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { InventoryLog } from "@/types/inventory"
import { Product } from "@/types/product"

export default function InventoryAdjustmentsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [logs, setLogs] = useState<InventoryLog[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ data: productRows }, { data: logRows }] = await Promise.all([
        supabaseClient
          .from("products")
          .select("id, name, sku, selling_price, cost_price, stock_quantity, low_stock_threshold, expiration_date, supplier"),
        supabaseClient
          .from("inventory_logs")
          .select("id, product_id, adjustment_type, quantity, reason, created_at, recorded_by")
          .order("created_at", { ascending: false }),
      ])
      const mappedProducts: Product[] = (productRows ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku ?? undefined,
        sellingPrice: Number(row.selling_price ?? 0),
        costPrice: Number(row.cost_price ?? 0),
        stockQuantity: row.stock_quantity,
        lowStockThreshold: row.low_stock_threshold,
        expirationDate: row.expiration_date ?? undefined,
        supplier: row.supplier ?? undefined,
      }))
      const mappedLogs: InventoryLog[] = (logRows ?? []).map((row) => ({
        id: row.id,
        productId: row.product_id,
        type: row.adjustment_type,
        quantity: Number(row.quantity ?? 0),
        reason: row.reason ?? undefined,
        date: row.created_at,
        recordedBy: row.recorded_by ?? "System",
      }))
      if (!cancelled) {
        setProducts(mappedProducts)
        setLogs(mappedLogs)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const recentLogs = useMemo(
    () =>
      [...logs]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8),
    [logs],
  )

  const handleAdjustmentSubmit = async ({
    productId,
    type,
    quantity,
    reason,
  }: Omit<InventoryLog, "id" | "date" | "recordedBy">) => {
    const current = products.find((p) => p.id === productId)
    if (!current) return
    const stockBefore = current.stockQuantity
    const delta = type === "StockIn" ? quantity : -quantity
    const stockAfter = Math.max(0, stockBefore + delta)

    await supabaseClient.from("inventory_logs").insert({
      product_id: productId,
      adjustment_type: type,
      quantity: delta,
      reason: reason ?? null,
      stock_before: stockBefore,
      stock_after: stockAfter,
    })

    setProducts((prev) =>
      prev.map((product) => (product.id === productId ? { ...product, stockQuantity: stockAfter } : product)),
    )
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        productId,
        type,
        quantity: delta,
        reason,
        date: new Date().toISOString(),
        recordedBy: "System",
      },
      ...prev,
    ])
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Inventory Adjustments</h2>
            <p className="mt-1 text-gray-600">
              Log stock-in, stock-out, and spoilage to keep counts accurate.
            </p>
          </div>
          <Link href="/inventory" className="text-sm text-blue-600 hover:underline">
            Back to Inventory
          </Link>
        </div>

        <AdjustmentForm products={products} onSubmit={handleAdjustmentSubmit} />

        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Recent Adjustments</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLogs.map((log) => {
                  const product = products.find((item) => item.id === log.productId)
                  return (
                    <tr key={log.id}>
                      <td className="px-3 py-2 text-sm text-gray-700">{product?.name ?? "-"}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{log.type}</td>
                      <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                        {log.quantity}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">{log.reason ?? "-"}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {new Date(log.date).toLocaleString("en-PH")}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
