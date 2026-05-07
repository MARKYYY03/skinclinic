"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import StockTable from "@/components/inventory/StockTable"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { InventoryLog } from "@/types/inventory"
import { Product } from "@/types/product"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  )

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
      const recorderIds = Array.from(new Set((logRows ?? []).map((row) => row.recorded_by).filter(Boolean)))
      const { data: profiles } = recorderIds.length
        ? await supabaseClient.from("profiles").select("id, full_name").in("id", recorderIds as string[])
        : { data: [] as Array<{ id: string; full_name: string }> }
      const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]))

      if (cancelled) return
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
        recordedBy: row.recorded_by ? nameById.get(row.recorded_by) ?? "Unknown" : "System",
      }))
      setProducts(mappedProducts)
      setLogs(mappedLogs)
      setSelectedProductId(mappedProducts[0]?.id ?? null)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId],
  )

  const selectedProductLogs = useMemo(
    () =>
      logs
        .filter((log) => log.productId === selectedProductId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [logs, selectedProductId],
  )

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Inventory</h2>
            <p className="mt-1 text-gray-600">
              Stock overview with low-stock and expiry monitoring.
            </p>
          </div>
          <Link
            href="/inventory/adjustments"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Log Adjustment
          </Link>
        </div>

        <StockTable
          products={products}
          logs={logs}
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
        />

        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-gray-900">
            Inventory Log {selectedProduct ? `- ${selectedProduct.name}` : ""}
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Date
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
                    Recorded By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedProductLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">
                      No movement records for this product.
                    </td>
                  </tr>
                ) : (
                  selectedProductLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        {new Date(log.date).toLocaleString("en-PH")}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">{log.type}</td>
                      <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                        {log.quantity}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">{log.reason ?? "-"}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{log.recordedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
