"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import { useCurrentUser } from "@/lib/auth/current-user"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Product } from "@/types/product"
import DataPaginator from "@/components/ui/DataPaginator"
import ProductForm from "@/components/inventory/ProductForm"

export default function ProductsPage() {
  const { role } = useCurrentUser()
  const canManage = role === "Owner" || role === "Admin"
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchProducts = async () => {
    const { data } = await supabaseClient
      .from("products")
      .select("id, name, sku, selling_price, cost_price, stock_quantity, low_stock_threshold, expiration_date, supplier")
      .order("name")

    setProducts(
      (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku ?? undefined,
        sellingPrice: Number(row.selling_price ?? 0),
        costPrice: Number(row.cost_price ?? 0),
        stockQuantity: row.stock_quantity,
        lowStockThreshold: row.low_stock_threshold,
        expirationDate: row.expiration_date ?? undefined,
        supplier: row.supplier ?? undefined,
      })),
    )
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (cancelled) return
      await fetchProducts()
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Products</h2>
            <p className="mt-1 text-gray-600">
              Track retail items, stock levels, and supplier details.
            </p>
          </div>
          {canManage ? (
            <button
              onClick={() => {
                setSelectedProduct(null)
                setModalMode("create")
                setIsModalOpen(true)
              }}
              className="rounded bg-[#6B7A3E] px-4 py-2 text-white hover:bg-[#5a6e35]"
            >
              Add Product
            </button>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  SKU / Supplier
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Sell / Cost
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Expiry
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <p>{product.sku}</p>
                    <p className="text-xs text-gray-500">{product.supplier}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    <p>{formatCurrency(product.sellingPrice)}</p>
                    <p className="text-xs text-gray-500">
                      Cost {formatCurrency(product.costPrice)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <span
                      className={`font-semibold ${
                        product.stockQuantity <= product.lowStockThreshold
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                    <p className="text-xs text-gray-500">Threshold {product.lowStockThreshold}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.expirationDate ? formatDate(product.expirationDate) : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          setSelectedProduct(product)
                          setModalMode("view")
                          setIsModalOpen(true)
                        }}
                        className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        View
                      </button>

                      {canManage ? (
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setModalMode("edit")
                            setIsModalOpen(true)
                          }}
                          className="rounded-md bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          Edit
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen ? (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            style={{ zIndex: 9999 }}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              style={{ zIndex: 10000 }}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === "create"
                    ? "Add Product"
                    : modalMode === "edit"
                      ? "Edit Product"
                      : "Product Details"}
                </h2>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  type="button"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-6">
                {modalMode === "create" ? (
                  <div className="pt-2">
                    <ProductForm
                      product={undefined}
                      onSuccess={() => {
                        setIsModalOpen(false)
                        void fetchProducts()
                      }}
                      onCancel={() => setIsModalOpen(false)}
                    />
                  </div>
                ) : modalMode === "edit" ? (
                  selectedProduct ? (
                    <div className="pt-2">
                      <ProductForm
                        product={selectedProduct}
                        onSuccess={() => {
                          setIsModalOpen(false)
                          void fetchProducts()
                        }}
                        onCancel={() => setIsModalOpen(false)}
                      />
                    </div>
                  ) : null
                ) : selectedProduct ? (
                  <>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-white p-4 shadow border">
                        <p className="text-sm text-gray-500">Selling Price</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(selectedProduct.sellingPrice)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-4 shadow border">
                        <p className="text-sm text-gray-500">Cost Price</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(selectedProduct.costPrice)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-4 shadow border">
                        <p className="text-sm text-gray-500">Current Stock</p>
                        <p
                          className={`text-xl font-bold ${
                            selectedProduct.stockQuantity <= selectedProduct.lowStockThreshold
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {selectedProduct.stockQuantity}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-4 shadow border">
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedProduct.expirationDate
                            ? formatDate(selectedProduct.expirationDate)
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-5 shadow border">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <p className="text-sm text-gray-700">
                          <strong>SKU:</strong> {selectedProduct.sku ?? "N/A"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Supplier:</strong> {selectedProduct.supplier ?? "N/A"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Low Stock Threshold:</strong> {selectedProduct.lowStockThreshold}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Estimated Margin:</strong>{" "}
                          {Math.round(
                            ((selectedProduct.sellingPrice - selectedProduct.costPrice) /
                              selectedProduct.sellingPrice) *
                              100,
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageWrapper>
  )
}
