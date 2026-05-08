import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Product } from "@/types/product"
import type { InventoryLog } from "@/types/inventory"
import { mapProductRowToProduct, mapInventoryLogRowToLog } from "@/lib/api/inventory-client"

// ============ SERVER SIDE (Server Components & Route Handlers) ============

/** Fetch all active products ordered by name */
export async function getProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  return (data ?? []).map((row: any) => mapProductRowToProduct(row))
}

/** Fetch product by ID */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from("products").select("*").eq("id", id).single()

  return data ? mapProductRowToProduct(data) : null
}

/** Fetch all inventory logs for a product, ordered by newest first */
export async function getInventoryLogsByProductId(productId: string): Promise<InventoryLog[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("inventory_logs")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  return (data ?? []).map((row: any) => mapInventoryLogRowToLog(row))
}

/** Fetch all inventory logs with product and staff details */
export async function getAllInventoryLogs(): Promise<
  (InventoryLog & { productName: string; staffName: string })[]
> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("inventory_logs")
    .select(
      "*, products(name), profiles(full_name)",
    )
    .order("created_at", { ascending: false })

  return (data ?? []).map((row: any) => ({
    id: row.id,
    productId: row.product_id,
    type: row.adjustment_type,
    quantity: row.quantity,
    reason: row.reason,
    date: row.created_at,
    recordedBy: row.recorded_by,
    productName: row.products?.name ?? "Unknown",
    staffName: row.profiles?.full_name ?? "Unknown",
  }))
}
