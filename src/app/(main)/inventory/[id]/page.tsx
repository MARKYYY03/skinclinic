import { notFound } from "next/navigation"
import Link from "next/link"
import PageWrapper from "@/components/layout/PageWrapper"
import AdjustmentHistoryTable from "@/components/inventory/AdjustmentHistoryTable"
import { getProductById, getInventoryLogsByProductId, getAllInventoryLogs } from "@/lib/api/inventory"
import { formatCurrency, formatDate } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  
  const [product, logs, allLogsWithStaffNames] = await Promise.all([
    getProductById(id),
    getInventoryLogsByProductId(id),
    getAllInventoryLogs(),
  ])

  if (!product) {
    notFound()
  }

  // Enhance logs with staff names
  const logsMap = new Map(allLogsWithStaffNames.map((log) => [log.id, log]))
  const enrichedLogs = logs.map((log) => ({
    ...log,
    staffName: logsMap.get(log.id)?.staffName ?? "Unknown",
  }))

  // Check status
  const today = new Date()
  const expiryDate = product.expirationDate ? new Date(product.expirationDate) : null
  const daysToExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const isLowStock = product.stockQuantity <= product.lowStockThreshold
  const isExpiringS = daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= 30
  const isExpired = daysToExpiry !== null && daysToExpiry < 0

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/inventory" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Inventory
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/inventory/adjustments?productId=${id}`}
              className="rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700"
            >
              Log Adjustment
            </Link>
          </div>
        </div>

        {/* Product Info Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.sku && <p className="mt-1 text-sm text-gray-600">SKU: {product.sku}</p>}
            </div>
            <div className="flex gap-2">
              {isLowStock && (
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  🔴 Low Stock
                </span>
              )}
              {isExpiringS && (
                <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  🟡 Expiring Soon
                </span>
              )}
              {isExpired && (
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  🔴 Expired
                </span>
              )}
              {!isLowStock && !isExpiringS && !isExpired && (
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  ✅ OK
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 mb-6">
            {/* Stock Section */}
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-gray-600">Current Stock</p>
              <p className={`mt-2 text-3xl font-bold ${isLowStock ? "text-red-600" : "text-green-600"}`}>
                {product.stockQuantity}
              </p>
              <p className="mt-1 text-xs text-gray-600">units</p>
            </div>

            {/* Threshold */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Low Stock Threshold</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{product.lowStockThreshold}</p>
              <p className="mt-1 text-xs text-gray-600">units</p>
            </div>

            {/* Supplier */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Supplier</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{product.supplier || "—"}</p>
            </div>

            {/* Cost Price */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Cost Price</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(product.costPrice)}</p>
            </div>

            {/* Selling Price */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Selling Price</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(product.sellingPrice)}</p>
            </div>

            {/* Expiration Date */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Expiration Date</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {product.expirationDate ? formatDate(product.expirationDate) : "—"}
              </p>
              {daysToExpiry !== null && (
                <p className={`mt-1 text-xs ${daysToExpiry < 0 ? "text-red-600" : daysToExpiry <= 30 ? "text-yellow-600" : "text-green-600"}`}>
                  {daysToExpiry < 0 
                    ? `Expired ${Math.abs(daysToExpiry)} days ago`
                    : `Expires in ${daysToExpiry} days`
                  }
                </p>
              )}
            </div>
          </div>

          {/* Stock Value */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Stock Value (Cost)</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatCurrency(product.costPrice * product.stockQuantity)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Value (Selling)</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatCurrency(product.sellingPrice * product.stockQuantity)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Adjustment History */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Stock Movement History</h2>
          <AdjustmentHistoryTable logs={enrichedLogs} />
        </div>
      </div>
    </PageWrapper>
  )
}
