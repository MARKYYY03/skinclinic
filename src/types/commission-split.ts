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

