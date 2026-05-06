"use client"

import { usePathname } from "next/navigation"

import { navigationTitleForPath } from "@/lib/constants"

interface HeaderProps {
  userName?: string
  userRole?: string
  onToggleSidebar?: () => void
}

export default function Header({
  userName = "User",
  userRole = "Staff",
  onToggleSidebar,
}: HeaderProps) {
  const pathname = usePathname()
  const pageTitle = navigationTitleForPath(pathname) ?? "Relevare"

  return (
    <header className="border-b border-[#cfd4b8] bg-[#6B7A3E] px-6 py-3 text-[#F5F0E8] shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="mr-4 rounded p-2 hover:bg-black/15 md:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-[28px]">
            {pageTitle}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs opacity-90">{userRole}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/15 text-sm font-semibold">
            {userName.trim().slice(0, 1).toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  )
}
