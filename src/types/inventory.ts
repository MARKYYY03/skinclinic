export interface InventoryLog {
  id: string
  productId: string
  type: "StockIn" | "StockOut" | "Spoilage" | "Damaged"
  quantity: number
  reason?: string
  date: string
  recordedBy: string
}
