import Link from "next/link"
import type { Product } from "@/types/product"

interface LowStockAlertProps {
  products: Product[]
}

export default function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border-l-4 border-l-orange-500 bg-white p-6 shadow">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <span className="mr-2 text-2xl">⚠️</span>
        Low Stock Alerts
      </h3>
      <div className="space-y-2 mb-4">
        {products.slice(0, 5).map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">
                Stock: <span className="font-semibold text-red-600">{product.stockQuantity}</span> / Threshold: {product.lowStockThreshold}
              </p>
            </div>
            <Link
              href={`/inventory/adjustments?productId=${product.id}`}
              className="ml-3 rounded-lg bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700"
            >
              Restock
            </Link>
          </div>
        ))}
      </div>
      <Link
        href="/inventory?filter=low-stock"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        View All →
      </Link>
    </div>
  )
}
