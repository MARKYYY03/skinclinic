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
  /** Set when redeeming a package session (real `client_packages.id`). */
  clientPackageId?: string | null
  isPackageRedemption?: boolean
  /** Original unit price before package redemption toggle (for UI). */
  baseUnitPrice?: number
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
  amountPaid: number
  balanceDue: number
  staffIds: string[]
  staffNames?: string[]
  notes?: string
  status: "Completed" | "Partial" | "Voided"
  createdBy: string
  createdAt: string
}
