import { Commission } from "@/types/commission"
import { Expense } from "@/types/expense"
import { ClientPackage, ServicePackage } from "@/types/package"

export interface CommissionSplitEntry {
  id: string
  transactionId: string
  date: string
  serviceName: string
  poolAmount: number
  staffShares: Array<{
    staffId: string
    staffName: string
    amount: number
  }>
}

export const mockPackageTemplates: ServicePackage[] = [
  {
    id: "pkg-001",
    name: "Hydra Facial 5 Sessions",
    serviceId: "s-001",
    sessionCount: 5,
    price: 7000,
    validityDays: 365,
  },
  {
    id: "pkg-002",
    name: "Diamond Peel 10 Sessions",
    serviceId: "s-002",
    sessionCount: 10,
    price: 10000,
    validityDays: 365,
  },
]

export const mockClientPackages: ClientPackage[] = [
  {
    id: "cp-001",
    clientId: "c-001",
    packageId: "pkg-001",
    packageName: "Hydra Facial 5 Sessions",
    totalSessions: 5,
    sessionsUsed: 2,
    sessionsRemaining: 3,
    purchasedAt: "2026-04-05T10:00:00.000Z",
    expiresAt: "2027-04-05T10:00:00.000Z",
    isTransferable: true,
  },
]

export const mockClientsForPackages = [
  { id: "c-001", name: "Ana Santos" },
  { id: "c-002", name: "Mark dela Cruz" },
  { id: "c-003", name: "Joy Reyes" },
]

export const mockCommissionSplits: CommissionSplitEntry[] = [
  {
    id: "split-001",
    transactionId: "tx-1001",
    date: "2026-05-05T09:30:00.000Z",
    serviceName: "Hydra Facial",
    poolAmount: 500,
    staffShares: [
      { staffId: "st-001", staffName: "Dr. Lim", amount: 250 },
      { staffId: "st-002", staffName: "Therapist Joy", amount: 250 },
    ],
  },
  {
    id: "split-002",
    transactionId: "tx-1002",
    date: "2026-05-05T11:15:00.000Z",
    serviceName: "Diamond Peel",
    poolAmount: 300,
    staffShares: [{ staffId: "st-002", staffName: "Therapist Joy", amount: 300 }],
  },
]

export const mockCommissions: Commission[] = mockCommissionSplits.flatMap((entry) =>
  entry.staffShares.map((share) => ({
    id: `${entry.id}-${share.staffId}`,
    transactionId: entry.transactionId,
    staffId: share.staffId,
    amount: share.amount,
    date: entry.date,
  })),
)

export const mockExpenses: Expense[] = [
  {
    id: "exp-001",
    category: "Operations",
    description: "Clinic utilities",
    amount: 5000,
    date: "2026-05-01",
    recordedBy: "Admin User",
  },
  {
    id: "exp-002",
    category: "TravelAllowance",
    description: "La Union outreach transport",
    amount: 2800,
    date: "2026-05-03",
    recordedBy: "Admin User",
  },
  {
    id: "exp-003",
    category: "CostOfService",
    description: "Facial consumables restock",
    amount: 4200,
    date: "2026-04-25",
    recordedBy: "Admin User",
  },
]
