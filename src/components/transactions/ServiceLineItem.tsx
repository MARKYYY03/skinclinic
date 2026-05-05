import { TransactionItem } from "@/types/transaction"

interface ServiceLineItemProps {
  item: TransactionItem
  index: number
  onUpdate: (index: number, updatedItem: TransactionItem) => void
  onRemove: (index: number) => void
}

export default function ServiceLineItem({
  item,
  index,
  onUpdate,
  onRemove,
}: ServiceLineItemProps) {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 1
    const total = quantity * (item.unitPrice - item.discount)
    onUpdate(index, { ...item, quantity, total })
  }

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const discount = parseFloat(e.target.value) || 0
    const total = item.quantity * (item.unitPrice - discount)
    onUpdate(index, { ...item, discount, total })
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-blue-50 p-4">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-600">Service • ₱{item.unitPrice.toLocaleString()}</p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm"
        />
        <span className="text-sm text-gray-600">qty</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.discount}
          onChange={handleDiscountChange}
          className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm"
          placeholder="Discount"
        />
        <span className="text-sm text-gray-600">discount</span>
      </div>

      <div className="text-right">
        <p className="font-semibold text-gray-900">₱{item.total.toLocaleString()}</p>
        <p className="text-xs text-gray-500">Total</p>
      </div>

      <button
        onClick={() => onRemove(index)}
        className="ml-2 rounded px-3 py-1 text-red-600 hover:bg-red-50"
      >
        ✕
      </button>
    </div>
  )
}
