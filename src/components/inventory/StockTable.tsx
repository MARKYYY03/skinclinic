"use client"

import { useState } from "react"
import { Product } from "@/types/product"
import { InventoryLog } from "@/types/inventory"
import ExpiryBadge from "@/components/inventory/ExpiryBadge"
import LowStockBadge from "@/components/inventory/LowStockBadge"
import DataPaginator from "@/components/ui/DataPaginator"

interface StockTableProps {
  products: Product[]
  logs: InventoryLog[]
  selectedProductId: string | null
  onSelectProduct: (productId: string) => void
}

export default function StockTable({
  products,
  logs,
  selectedProductId,
  onSelectProduct,
}: StockTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const getLatestMovement = (productId: string) =>
    logs
      .filter((log) => log.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  return (
    <div className="space-y-0 rounded-lg bg-white shadow overflow-hidden">
      <div className="overflow-x-auto rounded-b-none">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                SKU
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Stock Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Expiry Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Last Movement
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedProducts.map((product) => {
              const latestMovement = getLatestMovement(product.id)
              const isSelected = selectedProductId === product.id
              return (
                <tr
                  key={product.id}
                  className={
                    isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                  }
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.sku ?? "N/A"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {product.stockQuantity}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <LowStockBadge
                      stockQuantity={product.stockQuantity}
                      lowStockThreshold={product.lowStockThreshold}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <ExpiryBadge expirationDate={product.expirationDate} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {latestMovement
                      ? `${latestMovement.type} (${latestMovement.quantity})`
                      : "No movement yet"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product.id)}
                      className="font-medium text-[#6B7A3E] hover:text-[#5a6734]"
                    >
                      View Log
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <DataPaginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={products.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
