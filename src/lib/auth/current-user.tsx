"use client"

import { createContext, useContext } from "react"
import type { UserRole } from "@/types/user"

export interface CurrentUserProfile {
  userId: string
  fullName: string
  role: UserRole
}

const CurrentUserContext = createContext<CurrentUserProfile | null>(null)

export function CurrentUserProvider({
  value,
  children,
}: {
  value: CurrentUserProfile
  children: React.ReactNode
}) {
  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider")
  return ctx
}

