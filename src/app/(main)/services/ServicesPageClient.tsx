"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import PageWrapper from "@/components/layout/PageWrapper"
import ServiceTable from "@/components/services/ServiceTable"
import { useCurrentUser } from "@/lib/auth/current-user"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import type { ServiceListRow } from "@/types/service"

export default function ServicesPageClient() {
  const { role } = useCurrentUser()
  const canManage = role === "Owner" || role === "Admin"

  const [services, setServices] = useState<ServiceListRow[]>([])

  const load = useCallback(async () => {
    const { data } = await supabaseClient
      .from("services")
      .select("id, name, description, category, price, commission_rate, is_active")
      .order("name")
    setServices((data ?? []) as ServiceListRow[])
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(id)
  }, [load])

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1f2918]">Services</h2>
            <p className="mt-1 text-sm text-[#5c564c]">
              Catalog pricing, categories, and commission defaults.
            </p>
          </div>
          {canManage ? (
            <Link
              href="/services/new"
              className="inline-flex items-center justify-center rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
            >
              Add Service
            </Link>
          ) : null}
        </div>

        <ServiceTable services={services} canManage={canManage} onChanged={load} />
      </div>
    </PageWrapper>
  )
}
