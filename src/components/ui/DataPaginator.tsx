"use client"

interface DataPaginatorProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
  showSummary?: boolean
}

export default function DataPaginator({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  showSummary = true,
}: DataPaginatorProps) {
  if (totalPages <= 1) {
    return null
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-3 border-t border-[#e5ded4] bg-[#F5F0E8]/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      {showSummary && (
        <p className="text-sm text-[#6a6358]">
          Showing{" "}
          <span className="font-semibold text-[#314031]">
            {startItem}–{endItem}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#314031]">{totalItems}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-[#6a6358]">
            Rows per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-[#cfc6ba] bg-white px-3 py-1.5 text-sm text-[#314031] hover:border-[#b7b0a4]"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-[#cfc6ba] px-3 py-1.5 text-sm font-medium text-[#314031] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#E8E2D6]"
          >
            Previous
          </button>

          <span className="text-sm text-[#6a6358]">
            Page <span className="font-semibold text-[#314031]">{currentPage}</span> of{" "}
            <span className="font-semibold text-[#314031]">{totalPages}</span>
          </span>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-[#cfc6ba] px-3 py-1.5 text-sm font-medium text-[#314031] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#E8E2D6]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
