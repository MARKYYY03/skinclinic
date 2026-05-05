export interface Product {
  id: string
  name: string
  sku?: string
  sellingPrice: number
  costPrice: number
  stockQuantity: number
  lowStockThreshold: number
  expirationDate?: string
  supplier?: string
}
