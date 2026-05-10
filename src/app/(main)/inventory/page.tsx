"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import PageWrapper from "@/components/layout/PageWrapper"
import { getProducts } from "@/lib/actions/inventory"
import type { Product } from "@/types/product"
import { formatCurrency, formatDate } from "@/lib/utils"
import DataPaginator from "@/components/ui/DataPaginator"

interface FilterState {
  search: string
  status: "all" | "low-stock" | "expiring-soon" | "expired"
  supplier?: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const suppliers = useMemo(
    () => Array.from(new Set(products.map((p) => p.supplier).filter(Boolean))) as string[],
    [products],
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (
          !product.name.toLowerCase().includes(search) &&
          !(product.sku?.toLowerCase().includes(search))
        ) {
          return false
        }
      }

      if (filters.supplier && product.supplier !== filters.supplier) return false

      if (filters.status !== "all") {
        const today = new Date()
        const expiryDate = product.expirationDate ? new Date(product.expirationDate) : null
        const daysToExpiry = expiryDate
          ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : null

        if (filters.status === "low-stock") {
          if (product.stockQuantity > product.lowStockThreshold) return false
        } else if (filters.status === "expiring-soon") {
          if (daysToExpiry === null || daysToExpiry > 30 || daysToExpiry < 0) return false
        } else if (filters.status === "expired") {
          if (daysToExpiry === null || daysToExpiry >= 0) return false
        }
      }

      return true
    })
  }, [products, filters])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  useEffect(() => {
    setPage(1)
  }, [filters])

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const stats = useMemo(() => {
    const today = new Date()
    return {
      totalProducts: products.length,
      lowStock: products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length,
      expiringsoon: products.filter((p) => {
        if (!p.expirationDate) return false
        const expiry = new Date(p.expirationDate)
        const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return days > 0 && days <= 30
      }).length,
      expired: products.filter((p) => {
        if (!p.expirationDate) return false
        const expiry = new Date(p.expirationDate)
        return expiry < today
      }).length,
    }
  }, [products])

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
            <p className="mt-1 text-gray-600">Stock levels and product management</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/inventory/adjustments"
              className="rounded-lg bg-gray-600 px-4 py-2 text-white font-medium hover:bg-gray-700"
            >
              Log Adjustment
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{stats.lowStock}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-600">Expiring Soon</p>
            <p className="mt-2 text-2xl font-bold text-yellow-600">{stats.expiringsoon}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-600">Expired</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{stats.expired}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-lg bg-white p-4 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: e.target.value as FilterState["status"],
                  })
                }
                className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="low-stock">Low Stock</option>
                <option value="expiring-soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {suppliers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select
                  value={filters.supplier || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, supplier: e.target.value || undefined })
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier} value={supplier}>
                      {supplier}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow">
            <p className="text-gray-600">
              No products in inventory yet.{" "}
              <Link href="/products" className="text-blue-600 font-medium hover:underline">
                Go to the Products page to add products.
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-0 rounded-lg bg-white shadow overflow-hidden">
            <div className="overflow-x-auto rounded-b-none">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Cost Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Selling Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Threshold
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Expiration
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedProducts.map((product) => {
                    const today = new Date()
                    const expiryDate = product.expirationDate
                      ? new Date(product.expirationDate)
                      : null
                    const daysToExpiry = expiryDate
                      ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      : null

                    const statusBadges: React.ReactElement[] = []

                    if (product.stockQuantity <= 0) {
                      statusBadges.push(
                        <span
                          key="out"
                          className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 mr-1"
                        >
                          Out of Stock
                        </span>,
                      )
                    } else if (product.stockQuantity <= product.lowStockThreshold) {
                      statusBadges.push(
                        <span
                          key="low"
                          className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 mr-1"
                        >
                          Low Stock
                        </span>,
                      )
                    }

                    if (daysToExpiry !== null) {
                      if (daysToExpiry < 0) {
                        statusBadges.push(
                          <span
                            key="expired"
                            className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                          >
                            Expired
                          </span>,
                        )
                      } else if (daysToExpiry <= 30) {
                        statusBadges.push(
                          <span
                            key="expiring"
                            className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                          >
                            Expiring Soon
                          </span>,
                        )
                      }
                    }

                    if (statusBadges.length === 0) {
                      statusBadges.push(
                        <span
                          key="ok"
                          className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                        >
                          OK
                        </span>,
                      )
                    }

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{product.sku ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product.supplier ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {formatCurrency(product.costPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {formatCurrency(product.sellingPrice)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right text-sm font-bold ${
                            product.stockQuantity <= product.lowStockThreshold
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {product.stockQuantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{product.lowStockThreshold}</td>
                        <td className="px-4 py-3 text-sm">{statusBadges}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product.expirationDate ? formatDate(product.expirationDate) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/inventory/${product.id}`}
                            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            View
                          </Link>
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
              totalItems={filteredProducts.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
