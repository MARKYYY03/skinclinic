"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import PageWrapper from "@/components/layout/PageWrapper"
import SessionProgressBar from "@/components/packages/SessionProgressBar"
import { mockClientPackages, mockPackageTemplates } from "@/lib/mock/phase6"

export default function ClientPackagesPage() {
  const params = useParams()
  const clientId = params.id as string
  const [selectedTemplateId, setSelectedTemplateId] = useState("")

  const clientPackages = useMemo(
    () => mockClientPackages.filter((entry) => entry.clientId === clientId),
    [clientId],
  )

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
              {mockPackageTemplates.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedTemplateId}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              Assign to Client
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Assignment is UI-ready; connect API to persist.
          </p>
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
