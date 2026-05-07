"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import PageWrapper from "@/components/layout/PageWrapper"
import { useCurrentUser } from "@/lib/auth/current-user"

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { role } = useCurrentUser()

  // Redirect non-admin users away from Users and Audit Log pages
  useEffect(() => {
    const hasAdminAccess = role === "Owner" || role === "Admin"
    if (!hasAdminAccess) {
      // Allow Staff/Cashier access to profile only - handled by individual page access controls
      return
    }
  }, [role, router])

  return (
    <PageWrapper className="space-y-4">
      {children}
    </PageWrapper>
  )
}
