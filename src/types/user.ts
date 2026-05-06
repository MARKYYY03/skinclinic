export type UserRole = "Owner" | "Admin" | "Cashier" | "Staff"

export interface User {
  id: string
  name: string
  email?: string
  role: UserRole
  isActive: boolean
  createdAt?: string
}
