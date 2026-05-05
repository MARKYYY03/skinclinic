"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import StockTable from "@/components/inventory/StockTable"
import { mockInventoryLogs, mockInventoryProducts } from "@/lib/mock/inventory"
import { InventoryLog } from "@/types/inventory"
import { Product } from "@/types/product"

export default function InventoryPage() {
  const [products] = useState<Product[]>(mockInventoryProducts)
  const [logs] = useState<InventoryLog[]>(mockInventoryLogs)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products[0]?.id ?? null,
  )

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
