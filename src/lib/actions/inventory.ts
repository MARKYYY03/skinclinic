"use server"

import {
  getProducts as getProductsServerFn,
  getProductById as getProductByIdServerFn,
  getInventoryLogsByProductId as getInventoryLogsByProductIdServerFn,
  getAllInventoryLogs as getAllInventoryLogsServerFn,
} from "@/lib/api/inventory"

/** Server Action wrapper for getProducts - safe to call from Client Components */
export async function getProducts() {
  return await getProductsServerFn()
}

/** Server Action wrapper for getProductById - safe to call from Client Components */
export async function getProductById(id: string) {
  return await getProductByIdServerFn(id)
}

/** Server Action wrapper for getInventoryLogsByProductId - safe to call from Client Components */
export async function getInventoryLogsByProductId(productId: string) {
  return await getInventoryLogsByProductIdServerFn(productId)
}

/** Server Action wrapper for getAllInventoryLogs - safe to call from Client Components */
export async function getAllInventoryLogs() {
  return await getAllInventoryLogsServerFn()
}
