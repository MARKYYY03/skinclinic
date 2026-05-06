export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  actionType: "Create" | "Edit" | "Delete" | "Login"
  affectedEntity: string
  timestamp: string
}

