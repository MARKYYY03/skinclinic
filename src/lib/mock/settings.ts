import { User, UserRole } from "@/types/user"

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  actionType: "Create" | "Edit" | "Delete" | "Login"
  affectedEntity: string
  timestamp: string
}

export const mockCurrentUserRole: UserRole = "Admin"

export const mockUsers: User[] = [
  {
    id: "u-001",
    name: "Owner Account",
    email: "owner@relevare.ph",
    role: "Owner",
    isActive: true,
  },
  {
    id: "u-002",
    name: "Admin User",
    email: "admin@relevare.ph",
    role: "Admin",
    isActive: true,
  },
  {
    id: "u-003",
    name: "Cashier One",
    email: "cashier1@relevare.ph",
    role: "Cashier",
    isActive: true,
  },
  {
    id: "u-004",
    name: "Dr. Joy",
    email: "staff@relevare.ph",
    role: "Staff",
    isActive: true,
  },
]

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "al-001",
    userId: "u-002",
    userName: "Admin User",
    actionType: "Create",
    affectedEntity: "Client: Ana Santos",
    timestamp: "2026-05-05T08:15:00.000Z",
  },
  {
    id: "al-002",
    userId: "u-003",
    userName: "Cashier One",
    actionType: "Login",
    affectedEntity: "Auth Session",
    timestamp: "2026-05-05T09:00:00.000Z",
  },
  {
    id: "al-003",
    userId: "u-002",
    userName: "Admin User",
    actionType: "Edit",
    affectedEntity: "Product: Gentle Cleanser",
    timestamp: "2026-05-05T10:25:00.000Z",
  },
  {
    id: "al-004",
    userId: "u-001",
    userName: "Owner Account",
    actionType: "Delete",
    affectedEntity: "Expense: Duplicate entry",
    timestamp: "2026-05-05T11:40:00.000Z",
  },
]
