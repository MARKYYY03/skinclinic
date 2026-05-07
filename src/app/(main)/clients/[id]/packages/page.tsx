"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import PageWrapper from "@/components/layout/PageWrapper"
import SessionProgressBar from "@/components/packages/SessionProgressBar"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import { ClientPackage, ServicePackage } from "@/types/package"

export default function ClientPackagesPage() {
  const params = useParams()
  const clientId = params.id as string
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>([])
  const [packageTemplates, setPackageTemplates] = useState<ServicePackage[]>([])

  const selectedTemplate = useMemo(
    () => packageTemplates.find((entry) => entry.id === selectedTemplateId),
    [packageTemplates, selectedTemplateId],
  )

  const loadData = useCallback(async () => {
    const [{ data: templates }, { data: assigned }] = await Promise.all([
      supabaseClient
        .from("service_packages")
        .select("id, name, service_id, session_count, price, validity_days")
        .order("name"),
      supabaseClient
        .from("client_packages")
        .select("id, client_id, package_id, package_name, total_sessions, sessions_used, sessions_remaining, purchased_at, expires_at, is_transferable, transferred_to_client")
        .eq("client_id", clientId)
        .order("purchased_at", { ascending: false }),
    ])
    setPackageTemplates(
      (templates ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        serviceId: row.service_id,
        sessionCount: row.session_count,
        price: Number(row.price ?? 0),
        validityDays: row.validity_days,
      })),
    )
    setClientPackages(
      (assigned ?? []).map((row) => ({
        id: row.id,
        clientId: row.client_id,
        packageId: row.package_id,
        packageName: row.package_name,
        totalSessions: row.total_sessions,
        sessionsUsed: row.sessions_used,
        sessionsRemaining: row.sessions_remaining,
        purchasedAt: row.purchased_at,
        expiresAt: row.expires_at,
        isTransferable: row.is_transferable,
        transferredToClientId: row.transferred_to_client ?? undefined,
      })),
    )
  }, [clientId])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadData()
    }, 0)
    return () => window.clearTimeout(id)
  }, [clientId, loadData])

  async function assignPackage() {
    if (!selectedTemplate) return
    const now = new Date()
    const expiresAt = new Date(now.getTime() + selectedTemplate.validityDays * 24 * 60 * 60 * 1000)
    await supabaseClient.from("client_packages").insert({
      client_id: clientId,
      package_id: selectedTemplate.id,
      package_name: selectedTemplate.name,
      service_name: selectedTemplate.name,
      total_sessions: selectedTemplate.sessionCount,
      sessions_used: 0,
      price_paid: selectedTemplate.price,
      purchased_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      is_transferable: true,
    })
    setSelectedTemplateId("")
    await loadData()
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Client Packages</h2>
          <p className="mt-1 text-gray-600">
            Assign package templates and monitor session usage.
          </p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Assign New Package</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
              className="min-w-64 rounded border border-gray-300 px-3 py-2"
              aria-label="Select package template"
              title="Package template selector"
            >
              <option value="">Select template</option>
              {packageTemplates.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedTemplateId}
              onClick={() => void assignPackage()}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              Assign to Client
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Active Packages</h3>
          <div className="mt-3 space-y-3">
            {clientPackages.length === 0 ? (
              <p className="text-sm text-gray-500">No active packages for this client.</p>
            ) : (
              clientPackages.map((pkg) => (
                <div key={pkg.id} className="rounded border border-gray-200 p-3">
                  <p className="font-medium text-gray-900">{pkg.packageName}</p>
                  <SessionProgressBar
                    totalSessions={pkg.totalSessions}
                    sessionsUsed={pkg.sessionsUsed}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
