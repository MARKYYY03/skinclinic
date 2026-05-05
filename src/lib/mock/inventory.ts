import { Product } from "@/types/product"
import { InventoryLog } from "@/types/inventory"

export const mockInventoryProducts: Product[] = [
  {
    id: "prod-001",
    name: "Vitamin C Serum",
    sku: "SERUM-C-30",
    sellingPrice: 850,
    costPrice: 480,
    stockQuantity: 4,
    lowStockThreshold: 5,
    expirationDate: "2026-05-20",
    supplier: "SkinLab",
  },
  {
    id: "prod-002",
    name: "Sunscreen SPF50",
    sku: "SUN-SPF50",
    sellingPrice: 650,
    costPrice: 340,
    stockQuantity: 16,
    lowStockThreshold: 6,
    expirationDate: "2026-06-10",
    supplier: "DermaCare",
  },
  {
    id: "prod-003",
    name: "Gentle Cleanser",
    sku: "CLEAN-150",
    sellingPrice: 420,
    costPrice: 220,
    stockQuantity: 0,
    lowStockThreshold: 4,
    expirationDate: "2026-04-10",
    supplier: "Relevare Essentials",
  },
]

export const mockInventoryLogs: InventoryLog[] = [
  {
    id: "log-001",
    productId: "prod-001",
    type: "StockOut",
    quantity: 1,
    reason: "Used in procedure",
    date: "2026-05-05T08:30:00.000Z",
    recordedBy: "Admin User",
  },
  {
    id: "log-002",
    productId: "prod-002",
    type: "StockIn",
    quantity: 10,
    reason: "New delivery",
    date: "2026-05-04T10:00:00.000Z",
    recordedBy: "Admin User",
  },
  {
    id: "log-003",
    productId: "prod-003",
    type: "Spoilage",
    quantity: 2,
    reason: "Expired stock",
    date: "2026-05-03T15:10:00.000Z",
    recordedBy: "Admin User",
  },
]
