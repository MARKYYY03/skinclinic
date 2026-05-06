import type { Client } from "@/types/client"

export interface ClientRowDb {
  id: string
  full_name: string
  contact_number: string | null
  email: string | null
  address: string | null
  birthdate: string | null
  gender: "Male" | "Female" | "Other" | null
  medical_history: string | null
  allergies: string | null
  notes: string | null
  category: "Regular" | "VIP"
  created_at: string
}

export function mapClientRowToClient(row: ClientRowDb): Client {
  const birth =
    row.birthdate ??
    (row.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10))

  return {
    id: row.id,
    fullName: row.full_name,
    contactNumber: row.contact_number ?? "",
    email: row.email && row.email.length > 0 ? row.email : "—",
    address: row.address ?? "",
    birthdate: birth,
    gender: row.gender ?? "Other",
    medicalHistory: row.medical_history ?? undefined,
    allergies: row.allergies ?? undefined,
    notes: row.notes ?? undefined,
    category: row.category,
    createdAt: row.created_at,
  }
}
