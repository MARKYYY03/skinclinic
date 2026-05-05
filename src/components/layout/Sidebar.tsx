"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAVIGATION_ITEMS } from "@/lib/constants"
import { UserRole } from "@/types/user"
import {
  Archive,
  BarChart3,
  DollarSign,
  Gift,
  LayoutDashboard,
  Package,
  Receipt,
  Scissors,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

interface SidebarProps {
  userRole?: UserRole
  isCollapsed?: boolean
  onToggle?: () => void
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Scissors,
  Package,
  Receipt,
  Gift,
  DollarSign,
  Wallet,
  Archive,
  BarChart3,
  Settings,
}

export default function Sidebar({
  userRole = "Staff",
  isCollapsed = false,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname()

  // Filter navigation items based on user role
  const visibleItems = NAVIGATION_ITEMS.filter((item) => 
    (item.roles as readonly string[]).includes(userRole)
  )

  return (
    <div
      className={`sticky top-0 h-screen border-r border-[#d8ddd5] bg-[#f7f8f6] text-[#243225] transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="border-b border-[#d8ddd5] p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-[#2f7d32]">Relevare</h1>
              <p className="text-[11px] text-[#7d8f7d]">Clinic Management System</p>
            </div>
          )}
          <button onClick={onToggle} className="rounded p-1 hover:bg-[#e7ece5]">
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = iconMap[item.icon] ?? LayoutDashboard
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[#2f7d32] text-white"
                      : "text-[#2f3b2f] hover:bg-[#e7ece5]"
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="absolute right-0 bottom-0 left-0 border-t border-[#d8ddd5] p-4">
        <div className="flex items-center">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#dfe6dc] text-[#314031]">
            U
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-[#2f3b2f]">User Name</p>
              <p className="text-xs text-[#7d8f7d]">{userRole}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
