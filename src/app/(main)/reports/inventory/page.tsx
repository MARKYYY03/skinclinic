"use client"

import { useEffect, useMemo, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import { getProducts, getAllInventoryLogs } from "@/lib/actions/inventory"
import type { Product } from "@/types/product"
import type { InventoryLog } from "@/types/inventory"
import { formatCurrency, formatDate } from "@/lib/utils"
import DataPaginator from "@/components/ui/DataPaginator"

export default function InventoryReportPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [logs, setLogs] = useState<(InventoryLog & { productName: string; staffName: string })[]>([])
  const [startDate, setStartDate] = useState(new Date(2026, 4, 1).toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date(2026, 4, 31).toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)
  const [stockPage, setStockPage] = useState(1)
  const [stockPageSize, setStockPageSize] = useState(10)
  const [lowStockPage, setLowStockPage] = useState(1)
  const [lowStockPageSize, setLowStockPageSize] = useState(10)
  const [expiringPage, setExpiringPage] = useState(1)
  const [expiringPageSize, setExpiringPageSize] = useState(10)
  const [logsPage, setLogsPage] = useState(1)
  const [logsPageSize, setLogsPageSize] = useState(10)

  useEffect(() => {
    loadData()
  }, [startDate, endDate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, logsData] = await Promise.all([getProducts(), getAllInventoryLogs()])
      setProducts(productsData)
      setLogs(logsData)
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }

  // SECTION 1: Summary Cards
  const summaryStats = useMemo(() => {
    const totalProducts = products.length
    const costStockValue = products.reduce(
      (sum, p) => sum + p.costPrice * p.stockQuantity,
      0,
    )
    const sellingStockValue = products.reduce(
      (sum, p) => sum + p.sellingPrice * p.stockQuantity,
      0,
    )

    const startD = new Date(startDate)
    const endD = new Date(endDate)
    const spoilageThisMonth = logs
      .filter(
        (l) =>
          l.type === "Spoilage" &&
          new Date(l.date) >= startD &&
          new Date(l.date) <= endD,
      )
      .reduce((sum, l) => sum + l.quantity, 0)

    return {
      totalProducts,
      costStockValue,
      sellingStockValue,
      spoilageThisMonth,
    }
  }, [products, logs, startDate, endDate])

  // SECTION 2: Current Stock Table
  const stockSnapshot = useMemo(() => {
    return products
      .map((p) => {
        const today = new Date()
        const expiry = p.expirationDate ? new Date(p.expirationDate) : null
        const daysToExpiry = expiry
          ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : null

        let status = "OK"
        if (p.stockQuantity <= 0) status = "Out of Stock"
        else if (p.stockQuantity <= p.lowStockThreshold) status = "Low Stock"
        else if (daysToExpiry !== null && daysToExpiry < 0) status = "Expired"
        else if (daysToExpiry !== null && daysToExpiry <= 30) status = "Expiring Soon"

        return {
          ...p,
          stockValue: p.costPrice * p.stockQuantity,
          status,
          priority: ["Out of Stock", "Expired", "Low Stock", "Expiring Soon"].indexOf(
            status,
          ),
        }
      })
      .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))
  }, [products])

  // Current stock pagination
  const stockTotalPages = Math.max(1, Math.ceil(stockSnapshot.length / stockPageSize))
  const stockCurrentPage = Math.min(stockPage, stockTotalPages)
  const paginatedStockSnapshot = stockSnapshot.slice(
    (stockCurrentPage - 1) * stockPageSize,
    stockCurrentPage * stockPageSize,
  )

  // SECTION 3: Low Stock Alert List
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.stockQuantity <= p.lowStockThreshold)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
  }, [products])

  // Low stock pagination
  const lowStockTotalPages = Math.max(1, Math.ceil(lowStockProducts.length / lowStockPageSize))
  const lowStockCurrentPage = Math.min(lowStockPage, lowStockTotalPages)
  const paginatedLowStockProducts = lowStockProducts.slice(
    (lowStockCurrentPage - 1) * lowStockPageSize,
    lowStockCurrentPage * lowStockPageSize,
  )

  // SECTION 4: Spoilage Report
  const spoilageReport = useMemo(() => {
    const startD = new Date(startDate)
    const endD = new Date(endDate)
    return logs
      .filter(
        (l) =>
          (l.type === "Spoilage" || l.type === "Damaged") &&
          new Date(l.date) >= startD &&
          new Date(l.date) <= endD,
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [logs, startDate, endDate])

  // Spoilage pagination
  const spoilageTotalPages = Math.max(1, Math.ceil(spoilageReport.length / expiringPageSize))
  const spoilageCurrentPage = Math.min(expiringPage, spoilageTotalPages)
  const paginatedSpoilageReport = spoilageReport.slice(
    (spoilageCurrentPage - 1) * expiringPageSize,
    spoilageCurrentPage * expiringPageSize,
  )

  const spoilageCostLoss = useMemo(() => {
    return spoilageReport.reduce((sum, log) => {
      const product = products.find((p) => p.id === log.productId)
      return sum + (product ? product.costPrice * log.quantity : 0)
    }, 0)
  }, [spoilageReport, products])

  // SECTION 5: Stock Movement Summary
  const movementSummary = useMemo(() => {
    const startD = new Date(startDate)
    const endD = new Date(endDate)

    const summary: Record<
      string,
      {
        name: string
        totalIn: number
        totalOut: number
        totalSpoilage: number
        totalDamaged: number
        current: number
      }
    > = {}

    products.forEach((p) => {
      summary[p.id] = {
        name: p.name,
        totalIn: 0,
        totalOut: 0,
        totalSpoilage: 0,
        totalDamaged: 0,
        current: p.stockQuantity,
      }
    })

    logs
      .filter((l) => new Date(l.date) >= startD && new Date(l.date) <= endD)
      .forEach((log) => {
        if (summary[log.productId]) {
          if (log.type === "StockIn") summary[log.productId].totalIn += log.quantity
          else if (log.type === "StockOut")
            summary[log.productId].totalOut += log.quantity
          else if (log.type === "Spoilage")
            summary[log.productId].totalSpoilage += log.quantity
          else if (log.type === "Damaged")
            summary[log.productId].totalDamaged += log.quantity
        }
      })

    return Object.values(summary).sort((a, b) => a.name.localeCompare(b.name))
  }, [products, logs, startDate, endDate])

  // Movement summary pagination
  const movementTotalPages = Math.max(1, Math.ceil(movementSummary.length / logsPageSize))
  const movementCurrentPage = Math.min(logsPage, movementTotalPages)
  const paginatedMovementSummary = movementSummary.slice(
    (movementCurrentPage - 1) * logsPageSize,
    movementCurrentPage * logsPageSize,
  )

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Report</h1>
          <p className="mt-1 text-gray-600">Stock analysis, spoilage tracking, and movement summary</p>
        </div>

        {/* Date Filters */}
        <div className="flex gap-4 rounded-lg bg-white p-4 shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-600">Loading report...</p>
          </div>
        ) : (
          <>
            {/* SECTION 1: Summary Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-white p-4 shadow">
                <p className="text-sm text-gray-600">Total Active Products</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {summaryStats.totalProducts}
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow">
                <p className="text-sm text-gray-600">Stock Value (Cost)</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(summaryStats.costStockValue)}
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow">
                <p className="text-sm text-gray-600">Stock Value (Selling)</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(summaryStats.sellingStockValue)}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 shadow border border-red-200">
                <p className="text-sm text-gray-600">Spoilage This Period</p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  {summaryStats.spoilageThisMonth} units
                </p>
              </div>
            </div>

            {/* SECTION 2: Current Stock Snapshot */}
            <div className="rounded-lg bg-white shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Current Stock Snapshot</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Stock Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Cost Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Stock Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedStockSnapshot.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product.sku ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          {product.stockQuantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {formatCurrency(product.costPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(product.stockValue)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              product.status === "Out of Stock" ||
                              product.status === "Expired"
                                ? "bg-red-100 text-red-700"
                                : product.status === "Low Stock"
                                  ? "bg-orange-100 text-orange-700"
                                  : product.status === "Expiring Soon"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-700"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 3: Low Stock Alert List */}
            <div className="rounded-lg bg-white shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Needs Restocking</h2>
              </div>
              {lowStockProducts.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  ✅ All products are sufficiently stocked
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Current Stock
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Threshold
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Shortage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedLowStockProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                            {product.stockQuantity}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">
                            {product.lowStockThreshold}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                            {product.lowStockThreshold - product.stockQuantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SECTION 4: Spoilage & Damaged Log */}
            <div className="rounded-lg bg-white shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Spoilage & Damaged Log</h2>
              </div>
              {spoilageReport.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  No spoilage or damaged items in this period
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Type
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Reason
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Recorded By
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                            Cost Value Lost
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {spoilageReport.map((log) => {
                          const product = products.find((p) => p.id === log.productId)
                          const costLoss = product ? product.costPrice * log.quantity : 0

                          return (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(log.date)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {product?.name ?? "Unknown"}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                    log.type === "Spoilage"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  {log.type === "Spoilage" ? "🗑️ Spoilage" : "⚠️ Damaged"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                {log.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {log.reason || "—"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {log.staffName}
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                                {formatCurrency(costLoss)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="bg-red-50 border-t-2 border-red-200">
                        <tr>
                          <td colSpan={6} className="px-4 py-3 text-right text-sm font-bold text-red-600">
                            Total Cost Value Lost:
                          </td>
                          <td className="px-4 py-3 text-right text-lg font-bold text-red-600">
                            {formatCurrency(spoilageCostLoss)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: Stock Movement Summary */}
            <div className="rounded-lg bg-white shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Movement Summary</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Stock In
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Stock Out
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Spoilage
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Damaged
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Net Change
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Current Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movementSummary.map((item) => {
                      const netChange =
                        item.totalIn -
                        item.totalOut -
                        item.totalSpoilage -
                        item.totalDamaged

                      return (
                        <tr key={item.name} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                            +{item.totalIn}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                            -{item.totalOut}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                            -{item.totalSpoilage}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-orange-600">
                            -{item.totalDamaged}
                          </td>
                          <td className={`px-4 py-3 text-right text-sm font-bold ${
                            netChange >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {netChange >= 0 ? "+" : ""}{netChange}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                            {item.current}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
