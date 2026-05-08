import { supabaseClient } from "@/lib/supabase/client"
import type { Product } from "@/types/product"
import type { InventoryLog } from "@/types/inventory"

/** Create a new product */
export async function createProduct(product: {
  name: string
  sku?: string
  description?: string
  sellingPrice: number
  costPrice: number
  stockQuantity: number
  lowStockThreshold: number
  expirationDate?: string
  supplier?: string
  commissionRate?: number
  isActive: boolean
}) {
  const { data, error } = await supabaseClient
    .from("products")
    .insert([
      {
        name: product.name,
        sku: product.sku || `SKU-${Date.now()}`,
        description: product.description,
        selling_price: product.sellingPrice,
        cost_price: product.costPrice,
        stock_quantity: product.stockQuantity,
        low_stock_threshold: product.lowStockThreshold,
        expiration_date: product.expirationDate,
        supplier: product.supplier,
        commission_rate: product.commissionRate ?? 0,
        is_active: product.isActive,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return mapProductRowToProduct(data)
}

/** Update existing product */
export async function updateProduct(id: string, updates: Partial<Product>) {
  const updatePayload: Record<string, any> = {}

  if (updates.name) updatePayload.name = updates.name
  if (updates.sku) updatePayload.sku = updates.sku
  if (updates.sellingPrice) updatePayload.selling_price = updates.sellingPrice
  if (updates.costPrice) updatePayload.cost_price = updates.costPrice
  if (updates.stockQuantity !== undefined) updatePayload.stock_quantity = updates.stockQuantity
  if (updates.lowStockThreshold) updatePayload.low_stock_threshold = updates.lowStockThreshold
  if (updates.expirationDate) updatePayload.expiration_date = updates.expirationDate
  if (updates.supplier) updatePayload.supplier = updates.supplier

  const { data, error } = await supabaseClient
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return mapProductRowToProduct(data)
}

/** Deactivate product */
export async function deactivateProduct(id: string) {
  const { error } = await supabaseClient
    .from("products")
    .update({ is_active: false })
    .eq("id", id)

  if (error) throw error
}

/** Log inventory adjustment */
export async function logInventoryAdjustment(
  productId: string,
  adjustment: {
    type: "StockIn" | "StockOut" | "Spoilage" | "Damaged"
    quantity: number
    reason?: string
  },
  userId: string,
) {
  // Get current stock
  const { data: product } = await supabaseClient
    .from("products")
    .select("stock_quantity")
    .eq("id", productId)
    .single()

  if (!product) throw new Error("Product not found")

  const stockBefore = product.stock_quantity
  const stockAfter =
    adjustment.type === "StockIn"
      ? stockBefore + adjustment.quantity
      : stockBefore - adjustment.quantity

  if (stockAfter < 0) {
    throw new Error(
      `Insufficient stock. Current: ${stockBefore} units, cannot remove ${adjustment.quantity} units.`,
    )
  }

  // Insert inventory log
  const { data, error } = await supabaseClient
    .from("inventory_logs")
    .insert([
      {
        product_id: productId,
        adjustment_type: adjustment.type,
        quantity: adjustment.quantity,
        reason: adjustment.reason,
        stock_before: stockBefore,
        stock_after: stockAfter,
        recorded_by: userId,
      },
    ])
    .select()
    .single()

  if (error) throw error

  // Note: The database trigger (trg_inventory_apply) automatically updates products.stock_quantity
  // Do NOT manually update it here

  return mapInventoryLogRowToLog(data)
}

// ============ HELPERS ============

export function mapProductRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    sellingPrice: row.selling_price,
    costPrice: row.cost_price,
    stockQuantity: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
    expirationDate: row.expiration_date,
    supplier: row.supplier,
  }
}

export function mapInventoryLogRowToLog(row: any): InventoryLog {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.adjustment_type,
    quantity: row.quantity,
    reason: row.reason,
    date: row.created_at,
    recordedBy: row.recorded_by,
    stockBefore: row.stock_before,
    stockAfter: row.stock_after,
  }
}
