import Link from "next/link"
import PageWrapper from "@/components/layout/PageWrapper"
import { mockCurrentUserRole } from "@/lib/mock/settings"

const settingItems = [
  { href: "/settings/users", label: "Users" },
  { href: "/settings/services", label: "Services" },
  { href: "/settings/audit-log", label: "Audit Log" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const hasAccess =
    mockCurrentUserRole === "Owner" || mockCurrentUserRole === "Admin"

  if (!hasAccess) {
    return (
      <PageWrapper>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-1 text-gray-600">
            Settings are only available for Admin and Owner roles.
          </p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-gray-600">User control and audit trail.</p>
      </div>
      <div className="flex flex-wrap gap-2 rounded-lg bg-white p-2 shadow">
        {settingItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </PageWrapper>
  )
}
