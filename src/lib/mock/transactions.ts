import { Transaction } from "@/types/transaction"

export interface MockClient {
  id: string
  name: string
}

export interface MockService {
  id: string
  name: string
  price: number
}

export interface MockProduct {
  id: string
  name: string
  price: number
}

export interface ActivePackage {
  clientId: string
  serviceId: string
  packageName: string
  sessionsRemaining: number
}

export const mockClients: MockClient[] = [
  { id: "c-001", name: "Ana Santos" },
  { id: "c-002", name: "Mark dela Cruz" },
  { id: "c-003", name: "Joy Reyes" },
]

export const mockCashiers = ["Admin User", "Cashier 1", "Cashier 2"]

export const mockServices: MockService[] = [
  { id: "s-001", name: "Hydra Facial", price: 1800 },
  { id: "s-002", name: "Diamond Peel", price: 1200 },
  { id: "s-003", name: "Acne Treatment", price: 1500 },
]

export const mockProducts: MockProduct[] = [
  { id: "p-001", name: "Vitamin C Serum", price: 850 },
  { id: "p-002", name: "Sunscreen SPF50", price: 650 },
  { id: "p-003", name: "Gentle Cleanser", price: 420 },
]

export const mockActivePackages: ActivePackage[] = [
  {
    clientId: "c-001",
    serviceId: "s-001",
    packageName: "Hydra Facial 5 Sessions",
    sessionsRemaining: 2,
  },
]

export const mockTransactions: Transaction[] = [
  {
    id: "tx-1001",
    clientId: "c-001",
    clientName: "Ana Santos",
    items: [
      {
        type: "service",
        referenceId: "s-001",
        name: "Hydra Facial",
        quantity: 1,
        unitPrice: 1800,
        discount: 200,
        total: 1600,
      },
      {
        type: "product",
        referenceId: "p-001",
        name: "Vitamin C Serum",
        quantity: 1,
        unitPrice: 850,
        discount: 0,
        total: 850,
      },
    ],
    payments: [
      { method: "Cash", amount: 1200 },
      { method: "GCash", amount: 1250 },
    ],
    totalAmount: 2650,
    discountTotal: 200,
    netAmount: 2450,
    staffIds: ["staff-1"],
    notes: "Regular client visit",
    status: "Completed",
    createdBy: "Cashier 1",
    createdAt: "2026-05-05T09:30:00.000Z",
  },
  {
    id: "tx-1002",
    clientId: "c-002",
    clientName: "Mark dela Cruz",
    items: [
      {
        type: "service",
        referenceId: "s-002",
        name: "Diamond Peel",
        quantity: 1,
        unitPrice: 1200,
        discount: 0,
        total: 1200,
      },
    ],
    payments: [{ method: "Cash", amount: 600 }],
    totalAmount: 1200,
    discountTotal: 0,
    netAmount: 1200,
    staffIds: ["staff-2"],
    notes: "Balance to collect next visit",
    status: "Partial",
    createdBy: "Cashier 2",
    createdAt: "2026-05-05T11:15:00.000Z",
  },
]
