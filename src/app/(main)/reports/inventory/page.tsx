"use client"

import { useEffect, useMemo, useState } from "react"
import ExportButton from "@/components/reports/ExportButton"
import InventoryReportTable from "@/components/reports/InventoryReportTable"
import ReportFilters from "@/components/reports/ReportFilters"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import type { InventoryReportRow } from "@/types/reports"

export default function InventoryReportPage() {
  const [startDate, setStartDate] = useState("2026-05-01")
  const [endDate, setEndDate] = useState("2026-05-31")
  const [rows, setRows] = useState<InventoryReportRow[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ data: products }, { data: spoilageLogs }] = await Promise.all([
        supabaseClient
          .from("products")
          .select("id, name, stock_quantity, low_stock_threshold"),
        supabaseClient
          .from("inventory_logs")
          .select("product_id, quantity, created_at, adjustment_type")
          .eq("adjustment_type", "Spoilage")
          .gte("created_at", `${startDate}T00:00:00`)
          .lte("created_at", `${endDate}T23:59:59`),
      ])

      const spoilageByProduct = new Map<string, number>()
      ;(spoilageLogs ?? []).forEach((row) => {
        const qty = Math.abs(Number(row.quantity ?? 0))
        spoilageByProduct.set(row.product_id, (spoilageByProduct.get(row.product_id) ?? 0) + qty)
      })

      const mapped: InventoryReportRow[] = (products ?? []).map((row) => ({
        productName: row.name,
        stockQuantity: row.stock_quantity,
        lowStockThreshold: row.low_stock_threshold,
        spoilageQuantity: spoilageByProduct.get(row.id) ?? 0,
      }))
      if (!cancelled) setRows(mapped)
    })()
    return () => {
      cancelled = true
    }
  }, [endDate, startDate])

  const spoilageTotal = useMemo(
    () => rows.reduce((sum, row) => sum + row.spoilageQuantity, 0),
    [rows],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-gray-900">Inventory Report</h3>
        <ExportButton
          filename="inventory-report.csv"
          headers={["Product", "Stock", "Threshold", "Spoilage"]}
          rows={rows.map((row) => [
            row.productName,
            row.stockQuantity,
            row.lowStockThreshold,
            row.spoilageQuantity,
          ])}
        />
      </div>

      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <div className="rounded-lg bg-white p-4 shadow">
        <p className="text-sm text-gray-600">Total Spoilage Quantity</p>
        <p className="text-2xl font-bold text-gray-900">{spoilageTotal}</p>
      </div>

      <InventoryReportTable rows={rows} />
    </div>
  )
}
