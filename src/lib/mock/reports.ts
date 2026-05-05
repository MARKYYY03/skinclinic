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

export const mockSalesReportDaily: SalesReportRow[] = [
  {
    period: "2026-05-05",
    totalSales: 2450,
    cash: 1200,
    gcash: 1250,
    maya: 0,
    card: 0,
    bankTransfer: 0,
  },
]

export const mockSalesReportWeekly: SalesReportRow[] = [
  {
    period: "Week 18, 2026",
    totalSales: 18200,
    cash: 7400,
    gcash: 5600,
    maya: 2200,
    card: 1800,
    bankTransfer: 1200,
  },
]

export const mockSalesReportMonthly: SalesReportRow[] = [
  {
    period: "May 2026",
    totalSales: 72200,
    cash: 28800,
    gcash: 21200,
    maya: 9200,
    card: 8000,
    bankTransfer: 5000,
  },
]

export const mockExpenseReport: ExpenseReportRow[] = [
  { category: "Operations", amount: 5000 },
  { category: "TravelAllowance", amount: 2800 },
  { category: "CostOfService", amount: 4200 },
]

export const mockProfitLossReport: ProfitLossRow[] = [
  { period: "May 2026", revenue: 72200, expenses: 12000, profit: 60200 },
  { period: "Apr 2026", revenue: 65400, expenses: 10800, profit: 54600 },
]

export const mockInventoryReport: InventoryReportRow[] = [
  {
    productName: "Vitamin C Serum",
    stockQuantity: 4,
    lowStockThreshold: 5,
    spoilageQuantity: 0,
  },
  {
    productName: "Sunscreen SPF50",
    stockQuantity: 16,
    lowStockThreshold: 6,
    spoilageQuantity: 0,
  },
  {
    productName: "Gentle Cleanser",
    stockQuantity: 0,
    lowStockThreshold: 4,
    spoilageQuantity: 2,
  },
]

export const mockCommissionReport: CommissionReportRow[] = [
  {
    staffName: "Dr. Lim",
    transactionId: "tx-1001",
    serviceName: "Hydra Facial",
    commissionAmount: 250,
    date: "2026-05-05",
  },
  {
    staffName: "Therapist Joy",
    transactionId: "tx-1001",
    serviceName: "Hydra Facial",
    commissionAmount: 250,
    date: "2026-05-05",
  },
  {
    staffName: "Therapist Joy",
    transactionId: "tx-1002",
    serviceName: "Diamond Peel",
    commissionAmount: 300,
    date: "2026-05-05",
  },
]
