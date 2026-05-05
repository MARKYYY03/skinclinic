"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import ServiceLineItem from "@/components/transactions/ServiceLineItem"
import ProductLineItem from "@/components/transactions/ProductLineItem"
import PaymentSplitForm from "@/components/transactions/PaymentSplitForm"
import PackageRedemptionSelect from "@/components/transactions/PackageRedemptionSelect"
import { formatCurrency } from "@/lib/utils"
import {
  mockActivePackages,
  mockClients,
  mockProducts,
  mockServices,
} from "@/lib/mock/transactions"
import { TransactionItem, TransactionPayment } from "@/types/transaction"

export default function TransactionForm() {
  const router = useRouter()
  const [clientId, setClientId] = useState<string>("")
  const [isWalkIn, setIsWalkIn] = useState(false)
  const [items, setItems] = useState<TransactionItem[]>([])
  const [payments, setPayments] = useState<TransactionPayment[]>([
    { method: "Cash", amount: 0 },
  ])
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState("")

  const availablePackages = useMemo(() => {
    if (!clientId) return []
    return mockActivePackages
      .filter((pkg) => pkg.clientId === clientId && pkg.sessionsRemaining > 0)
      .map((pkg, index) => ({
        id: `${pkg.clientId}::${pkg.serviceId}::${index}`,
        packageName: pkg.packageName,
        sessionsRemaining: pkg.sessionsRemaining,
        expiresAt: "2027-01-01",
      }))
  }, [clientId])

  const selectedPackage = useMemo(
    () => availablePackages.find((pkg) => pkg.id === selectedPackageId),
    [availablePackages, selectedPackageId],
  )

  const grossAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  )
  const discountTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.discount * item.quantity, 0),
    [items],
  )
  const netAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items],
  )
  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  )

  const addServiceItem = () => {
    if (!selectedServiceId) return
    const service = mockServices.find((entry) => entry.id === selectedServiceId)
    if (!service) return
    const newItem: TransactionItem = {
      type: "service",
      referenceId: service.id,
      name: service.name,
      quantity: 1,
      unitPrice: service.price,
      discount: 0,
      total: service.price,
    }
    setItems((prev) => [...prev, newItem])
    setSelectedServiceId("")
  }

  const addProductItem = () => {
    if (!selectedProductId) return
    const product = mockProducts.find((entry) => entry.id === selectedProductId)
    if (!product) return
    const newItem: TransactionItem = {
      type: "product",
      referenceId: product.id,
      name: product.name,
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      total: product.price,
    }
    setItems((prev) => [...prev, newItem])
    setSelectedProductId("")
  }

  const addRedeemedPackageService = () => {
    if (!selectedPackage) return
    const [, packageServiceId] = selectedPackage.id.split("::")
    if (!packageServiceId) return
    const service = mockServices.find((entry) => entry.id === packageServiceId)
    if (!service) return

    const newItem: TransactionItem = {
      type: "service",
      referenceId: service.id,
      name: `${service.name} (Package Redemption)`,
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
    }
    setItems((prev) => [...prev, newItem])
    setSelectedPackageId(null)
  }

  const updateItem = (index: number, updatedItem: TransactionItem) => {
    setItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? updatedItem : item)))
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = () => {
    if (!isWalkIn && !clientId) {
      setSubmitError("Please select a client or mark as walk-in.")
      return
    }
    if (items.length === 0) {
      setSubmitError("Please add at least one service or product.")
      return
    }
    if (totalPaid !== netAmount) {
      setSubmitError("Split payment total must exactly match net amount before saving.")
      return
    }

    setSubmitError("")
    router.push("/transactions")
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-5 shadow">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Client</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-700">Client</span>
            <select
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              disabled={isWalkIn}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
            >
              <option value="">Select client</option>
              {mockClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-7 inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isWalkIn}
              onChange={(event) => {
                setIsWalkIn(event.target.checked)
                if (event.target.checked) {
                  setClientId("")
                  setSelectedPackageId(null)
                }
              }}
            />
            Walk-in client
          </label>
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Service Line Items</h3>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={selectedServiceId}
            onChange={(event) => setSelectedServiceId(event.target.value)}
            aria-label="Select service to add"
            title="Service selector"
            className="min-w-56 rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select service</option>
            {mockServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - {formatCurrency(service.price)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addServiceItem}
            className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            Add Service
          </button>
        </div>

        {!isWalkIn && clientId && (
          <div className="mb-4 rounded border border-blue-100 bg-blue-50 p-3">
            <PackageRedemptionSelect
              packages={availablePackages}
              selectedPackageId={selectedPackageId}
              onSelect={(packageId) => setSelectedPackageId(packageId)}
            />
            <button
              type="button"
              onClick={addRedeemedPackageService}
              disabled={!selectedPackage}
              className="mt-2 rounded bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              Redeem Package Session (Price auto-set to {formatCurrency(0)})
            </button>
          </div>
        )}

        <div className="space-y-2">
          {items
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => item.type === "service")
            .map(({ item, index }) => (
              <ServiceLineItem
                key={`${item.referenceId}-${index}`}
                item={item}
                index={index}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Product Line Items</h3>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            aria-label="Select product to add"
            title="Product selector"
            className="min-w-56 rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select product</option>
            {mockProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {formatCurrency(product.price)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addProductItem}
            className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
          >
            Add Product
          </button>
        </div>

        <div className="space-y-2">
          {items
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => item.type === "product")
            .map(({ item, index }) => (
              <ProductLineItem
                key={`${item.referenceId}-${index}`}
                item={item}
                index={index}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow">
        <PaymentSplitForm payments={payments} onChange={setPayments} totalAmount={netAmount} />
      </div>

      <div className="rounded-lg bg-white p-5 shadow">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Totals</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Gross</span>
            <span>{formatCurrency(grossAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Discount</span>
            <span>-{formatCurrency(discountTotal)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold text-gray-900">
            <span>Net</span>
            <span>{formatCurrency(netAmount)}</span>
          </div>
        </div>
        {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/transactions")}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  )
}
