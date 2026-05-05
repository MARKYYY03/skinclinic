export type ExpenseCategory =
  | "Operations"
  | "EmployeeRepresentation"
  | "TravelAllowance"
  | "CostOfService"

export interface Expense {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  date: string
  recordedBy: string
}
