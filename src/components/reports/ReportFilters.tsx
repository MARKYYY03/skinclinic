"use client"

interface ReportFiltersProps {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
}

export default function ReportFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ReportFiltersProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Start Date</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none force-light-input"
            aria-label="Start date"
            title="Report start date"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none force-light-input"
            aria-label="End date"
            title="Report end date"
          />
        </label>
      </div>
    </div>
  )
}
