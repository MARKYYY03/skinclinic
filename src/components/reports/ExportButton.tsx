"use client"

interface ExportButtonProps {
  filename: string
  headers: string[]
  rows: Array<Array<string | number>>
}

export default function ExportButton({ filename, headers, rows }: ExportButtonProps) {
  const handleExport = () => {
    const csvLines = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ]
    const csvContent = csvLines.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
    >
      Export CSV
    </button>
  )
}
