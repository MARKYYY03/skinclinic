export interface Report {
  id: string
  type: "Sales" | "Expenses" | "ProfitLoss" | "Inventory" | "Commissions"
  period: string
  data: Record<string, unknown>
  generatedAt: string
}
