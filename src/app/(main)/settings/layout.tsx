"use client"

import Link from "next/link"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import PageWrapper from "@/components/layout/PageWrapper"
import { useCurrentUser } from "@/lib/auth/current-user"

const adminSettingItems = [
  { href: "/settings/users", label: "Users" },
  { href: "/settings/services", label: "Services" },
  { href: "/settings/audit-log", label: "Audit Log" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role } = useCurrentUser()
  const hasAdminAccess = role === "Owner" || role === "Admin"
  const isProfilePage = pathname.startsWith("/settings/profile")

  useEffect(() => {
    if (!hasAdminAccess && !isProfilePage) {
      router.replace("/dashboard")
    }
  }, [hasAdminAccess, isProfilePage, router])

  if (!hasAdminAccess && !isProfilePage) {
    return <div className="min-h-[40vh] bg-[#f3f5f2]" aria-hidden />
  }

  return (
    <PageWrapper className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-[#1f2918]">Settings</h2>
        <p className="mt-1 text-sm text-[#5c564c]">
          Account settings and admin controls.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-[#dfd8cf] bg-white p-2 shadow-sm">
        <Link
          href="/settings/profile"
          className={`rounded-lg px-3 py-2 text-sm ${
            pathname.startsWith("/settings/profile")
              ? "bg-[#6B7A3E] font-semibold text-[#F5F0E8]"
              : "text-[#314031] hover:bg-[#F5F0E8]"
          }`}
        >
          Profile
        </Link>
        {hasAdminAccess &&
          adminSettingItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm ${
                pathname.startsWith(item.href)
                  ? "bg-[#6B7A3E] font-semibold text-[#F5F0E8]"
                  : "text-[#314031] hover:bg-[#F5F0E8]"
              }`}
            >
              {item.label}
            </Link>
          ))}
      </div>
      {children}
    </PageWrapper>
  )
}
