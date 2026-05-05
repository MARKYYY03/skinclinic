export type PaymentMethod =
  | "Cash"
  | "GCash"
  | "Maya"
  | "Card"
  | "BankTransfer"
  | "HomeCredit"

export interface TransactionItem {
  type: "service" | "product"
  referenceId: string
  name: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface TransactionPayment {
  method: PaymentMethod
  amount: number
}

export interface Transaction {
  id: string
  clientId: string
  clientName: string
  items: TransactionItem[]
  payments: TransactionPayment[]
  totalAmount: number
  discountTotal: number
  netAmount: number
  staffIds: string[]
  notes?: string
  status: "Completed" | "Partial" | "Voided"
  createdBy: string
  createdAt: string
}
