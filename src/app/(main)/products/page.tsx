import Link from "next/link"
import PageWrapper from "@/components/layout/PageWrapper"
import { mockProducts } from "@/lib/mock/catalog"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function ProductsPage() {
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
          <Link
            href="/products/new"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Product
          </Link>
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
              {mockProducts.map((product) => (
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
                    <Link
                      href={`/products/${product.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  )
}
