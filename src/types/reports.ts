export interface SalesReportRow {
  period: string
  totalSales: number
  cash: number
  gcash: number
  maya: number
  card: number
  bankTransfer: number
}

export interface ExpenseReportRow {
  category: string
  amount: number
}

export interface ProfitLossRow {
  period: string
  revenue: number
  expenses: number
  profit: number
}

export interface InventoryReportRow {
  productName: string
  stockQuantity: number
  lowStockThreshold: number
  spoilageQuantity: number
}

export interface CommissionReportRow {
  staffName: string
  transactionId: string
  serviceName: string
  commissionAmount: number
  date: string
}

