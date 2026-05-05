"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import AdjustmentForm from "@/components/inventory/AdjustmentForm"
import { mockInventoryLogs, mockInventoryProducts } from "@/lib/mock/inventory"
import { InventoryLog } from "@/types/inventory"
import { Product } from "@/types/product"

export default function InventoryAdjustmentsPage() {
  const [products, setProducts] = useState<Product[]>(mockInventoryProducts)
  const [logs, setLogs] = useState<InventoryLog[]>(mockInventoryLogs)

  const recentLogs = useMemo(
    () =>
      [...logs]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8),
    [logs],
  )

  const handleAdjustmentSubmit = ({
    productId,
    type,
    quantity,
    reason,
  }: Omit<InventoryLog, "id" | "date" | "recordedBy">) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product
        const nextQuantity =
          type === "StockIn"
            ? product.stockQuantity + quantity
            : Math.max(0, product.stockQuantity - quantity)

        return { ...product, stockQuantity: nextQuantity }
      }),
    )

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        productId,
        type,
        quantity,
        reason,
        date: new Date().toISOString(),
        recordedBy: "Admin User",
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
