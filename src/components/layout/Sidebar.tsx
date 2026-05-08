"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import type { NavItem } from "@/lib/constants"
import { NAVIGATION_ITEMS } from "@/lib/constants"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { UserRole } from "@/types/user"
import {
  Archive,
  BarChart3,
  DollarSign,
  Gift,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Scissors,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import ImageModal from "@/components/ImageModal"

interface SidebarProps {
  userName?: string
  userRole?: UserRole
  isCollapsed?: boolean
  onToggle?: () => void
  userId?: string
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

const oliveActive = "bg-[#6B7A3E] text-[#F5F0E8]"
const inactive = "text-[#314031] hover:bg-[#ebe6dd]"

function linkActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Sidebar({
  userName = "User",
  userRole = "Staff",
  isCollapsed = false,
  onToggle,
  userId,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const visibleItems = NAVIGATION_ITEMS.filter((item: NavItem) =>
    item.roles.includes(userRole),
  )

  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    if (!userId) return
    const savedPhoto = localStorage.getItem(`avatar_${userId}`)
    if (savedPhoto) setUserAvatar(savedPhoto)
    else setUserAvatar(null)
  }, [userId])

  const logout = useCallback(async () => {
    await supabaseClient.auth.signOut()
    router.replace("/login")
  }, [router])


  return (
    <div
      className={`sticky top-0 flex h-screen flex-col border-r border-[#dfd8cf] bg-[#F5F0E8] text-[#1f2918] transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="border-b border-[#dfd8cf] p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-[#6B7A3E]">Relevare</h1>
              <p className="text-[11px] text-[#6a6358]">
                Clinic Management System
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded p-1 hover:bg-[#ebe6dd]"
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard

            if (item.children?.length) {
              const childActive = item.children.some((c) =>
                linkActive(pathname, c.href),
              )
              const firstReportHref = item.children[0]?.href ?? "/reports/sales"

              if (isCollapsed) {
                return (
                  <li key={item.name}>
                    <Link
                      href={firstReportHref}
                      title={item.name}
                      className={`flex items-center justify-center rounded-md px-3 py-2 text-sm transition-colors ${
                        childActive ? oliveActive : inactive
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="sr-only">{item.name}</span>
                    </Link>
                  </li>
                )
              }

              return (
                <li key={item.name}>
                  <div
                    className={`flex items-center rounded-md px-3 py-2 text-xs font-semibold tracking-wide uppercase ${
                      childActive ? "text-[#6B7A3E]" : "text-[#6a6358]"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4 shrink-0" />
                    {item.name}
                  </div>
                  <ul className="mt-0.5 space-y-0.5 border-l border-[#cfc6ba] py-1 pl-2 ml-6">
                    {item.children
                      .filter((child) => !child.roles || child.roles.includes(userRole))
                      .map((child) => {
                      const active = linkActive(pathname, child.href)
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`flex rounded-md px-3 py-1.5 text-sm ${
                              active ? oliveActive : inactive
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            }

            const href = item.href!
            const isActive = linkActive(pathname, href)

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive ? oliveActive : inactive
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-[#dfd8cf] p-4">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            aria-label="View profile photo"
            className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e3ddd3] text-sm text-[#314031] overflow-hidden border-2 border-transparent hover:border-[#cfd4b8]"
          >
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userAvatar}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              userName.trim().slice(0, 1).toUpperCase() || "U"
            )}
          </button>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1f2918]">
                {userName}
              </p>
              <p className="text-xs text-[#6a6358]">{userRole}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={logout}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#6B7A3E] bg-white px-3 py-2 text-sm font-medium text-[#6B7A3E] hover:bg-[#ebe6dd]`}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed ? "Logout" : <span className="sr-only">Logout</span>}
        </button>

        {userAvatar && (
          <ImageModal
            isOpen={showImageModal}
            imageUrl={userAvatar}
            userName={userName}
            onClose={() => setShowImageModal(false)}
          />
        )}
      </div>

    </div>
  )
}
