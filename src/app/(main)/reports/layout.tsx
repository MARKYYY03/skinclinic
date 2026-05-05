import Link from "next/link"
import PageWrapper from "@/components/layout/PageWrapper"

const reportNavItems = [
  { href: "/reports/sales", label: "Sales" },
  { href: "/reports/expenses", label: "Expenses" },
  { href: "/reports/profit-loss", label: "Profit & Loss" },
  { href: "/reports/inventory", label: "Inventory" },
  { href: "/reports/commissions", label: "Commissions" },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageWrapper className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Reports</h2>
        <p className="mt-1 text-gray-600">Business performance dashboards and exports.</p>
      </div>
      <div className="flex flex-wrap gap-2 rounded-lg bg-white p-2 shadow">
        {reportNavItems.map((item) => (
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
