"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { UserRole } from "@/types/user"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { CurrentUserProvider } from "@/lib/auth/current-user"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [authStatus, setAuthStatus] = useState<"checking" | "authed" | "unauthed">("checking")
  const [userId, setUserId] = useState<string>("")
  const [userName, setUserName] = useState<string>("User")
  const [userRole, setUserRole] = useState<UserRole>("Staff")

  const canRender = useMemo(() => authStatus === "authed", [authStatus])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await supabaseClient.auth.getSession()
      if (cancelled) return

      if (error || !data.session?.user) {
        setAuthStatus("unauthed")
        router.replace("/login")
        return
      }

      const user = data.session.user
      setUserId(user.id)

      // Prefer profile name/role; fall back to auth email
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle()

      if (cancelled) return

      setUserName(profile?.full_name ?? user.email ?? "User")
      setUserRole((profile?.role as UserRole | undefined) ?? "Staff")
      setAuthStatus("authed")
    }

    void load()

    const { data: sub } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAuthStatus("unauthed")
        router.replace("/login")
        return
      }
      setAuthStatus("authed")
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [router])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  if (!canRender) {
    return <div className="min-h-screen bg-[#f3f5f2]" />
  }

  return (
    <CurrentUserProvider value={{ userId, fullName: userName, role: userRole }}>
      <div className="flex h-screen bg-[#f3f5f2] print:block print:h-auto print:bg-white">
        {/* Sidebar */}
        <div className="print:hidden">
          <Sidebar
            userName={userName}
            userRole={userRole}
            userId={userId}
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col print:flex-none">
          {/* Header */}
          <div className="print:hidden">
            <Header userName={userName} userRole={userRole} userId={userId} onToggleSidebar={toggleSidebar} />
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto print:flex-none print:overflow-visible">{children}</main>
        </div>
      </div>
    </CurrentUserProvider>
  )
}
