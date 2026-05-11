interface DiscountInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
}

export default function DiscountInput({
  value,
  onChange,
  label = "Overall Discount",
}: DiscountInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} (₱)
      </label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="0.00"
      />
    </div>
  )
}
