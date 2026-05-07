import { TransactionItem } from "@/types/transaction"
import { formatCurrency } from "@/lib/utils"

interface ServiceLineItemProps {
  item: TransactionItem
  index: number
  onUpdate: (index: number, updatedItem: TransactionItem) => void
  onRemove: (index: number) => void
  redeemOptions?: { id: string; label: string }[]
  onRedeemChange?: (enabled: boolean, clientPackageId: string | null) => void
}

export default function ServiceLineItem({
  item,
  index,
  onUpdate,
  onRemove,
  redeemOptions = [],
  onRedeemChange,
}: ServiceLineItemProps) {
  const redeeming = Boolean(item.isPackageRedemption)
  const canRedeem = redeemOptions.length > 0 && Boolean(onRedeemChange)

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (redeeming) return
    const quantity = parseInt(e.target.value, 10) || 1
    const total = quantity * (item.unitPrice - item.discount)
    onUpdate(index, { ...item, quantity, total })
  }

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (redeeming) return
    const discount = parseFloat(e.target.value) || 0
    const total = item.quantity * (item.unitPrice - discount)
    onUpdate(index, { ...item, discount, total })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#dfd8cf] bg-[#F5F0E8]/50 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#1f2918]">{item.name}</p>
        <p className="text-sm text-[#6a6358]">
          {redeeming ? (
            <span>Package session — {formatCurrency(0)}</span>
          ) : (
            <span>Unit {formatCurrency(item.unitPrice)}</span>
          )}
        </p>
        {canRedeem ? (
          <div className="mt-2 space-y-2 border-t border-[#e5ded4] pt-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#314031]">
              <input
                type="checkbox"
                checked={redeeming}
                onChange={(e) => {
                  const on = e.target.checked
                  if (!on) onRedeemChange?.(false, null)
                  else onRedeemChange?.(true, redeemOptions[0]?.id ?? null)
                }}
                className="h-4 w-4 rounded border-[#cfc6ba]"
              />
              Redeem package session
            </label>
            {redeeming ? (
              <select
                value={item.clientPackageId ?? ""}
                onChange={(e) => {
                  const id = e.target.value || null
                  onRedeemChange?.(true, id)
                }}
                className="w-full max-w-xs rounded-lg border border-[#cfc6ba] px-2 py-1.5 text-sm"
                aria-label="Package to redeem"
              >
                {redeemOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={item.quantity}
            disabled={redeeming}
            onChange={handleQuantityChange}
            className="w-16 rounded border border-[#cfc6ba] px-2 py-1 text-center text-sm disabled:bg-[#ebe6dd]"
          />
          <span className="text-sm text-[#6a6358]">qty</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.discount}
            disabled={redeeming}
            onChange={handleDiscountChange}
            className="w-24 rounded border border-[#cfc6ba] px-2 py-1 text-center text-sm disabled:bg-[#ebe6dd]"
          />
          <span className="text-sm text-[#6a6358]">disc</span>
        </div>

        <div className="text-right">
          <p className="font-semibold text-[#1f2918]">{formatCurrency(item.total)}</p>
          <p className="text-xs text-[#6a6358]">Line total</p>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded px-3 py-1 text-sm text-red-700 hover:bg-red-50"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
