"use client"

import { usePathname } from "next/navigation"
import { NAVIGATION_ITEMS } from "@/lib/constants"

interface HeaderProps {
  userRole?: string
  onToggleSidebar?: () => void
}

export default function Header({
  userRole = "Staff",
  onToggleSidebar,
}: HeaderProps) {
  const pathname = usePathname()

  // Get current page title from navigation items
  const currentItem = NAVIGATION_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  )

  const pageTitle = currentItem?.name || "Dashboard"

  return (
    <header className="border-b border-[#d8ddd5] bg-[#f7f8f6] px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="mr-4 rounded p-2 hover:bg-gray-100 md:hidden"
          >
            ☰
          </button>
          <h1 className="text-[28px] font-semibold text-[#1f2b1f]">{pageTitle}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-[#1f2b1f]">User Name</p>
            <p className="text-xs text-[#7d8f7d]">{userRole}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfe6dc] text-[#314031]">
            U
          </div>
          <button className="rounded border border-[#d8ddd5] bg-white px-3 py-1 text-sm text-[#4f614f] hover:bg-[#f1f3ef] hover:text-[#1f2b1f]">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
