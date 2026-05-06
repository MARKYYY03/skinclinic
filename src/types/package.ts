export interface ServicePackage {
  id: string
  name: string
  serviceId: string
  serviceName?: string
  sessionCount: number
  price: number
  validityDays: number
  isActive?: boolean
}

export interface ClientPackage {
  id: string
  clientId: string
  packageId: string
  packageName: string
  totalSessions: number
  sessionsUsed: number
  sessionsRemaining: number
  purchasedAt: string
  expiresAt: string
  isTransferable: boolean
  transferredToClientId?: string
}
