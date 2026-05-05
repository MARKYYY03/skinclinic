export interface Client {
  id: string
  fullName: string
  contactNumber: string
  email: string
  address: string
  birthdate: string
  gender: "Male" | "Female" | "Other"
  medicalHistory?: string
  allergies?: string
  notes?: string
  category: "Regular" | "VIP"
  createdAt: string
}
