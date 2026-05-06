"use client"

import { useState } from "react"

import VisitHistoryTable from "@/components/clients/VisitHistoryTable"
import PackageStatusCard from "@/components/clients/PackageStatusCard"
import ArAlert from "@/components/clients/ArAlert"
import { Client } from "@/types/client"

type TabId = "overview" | "visits" | "packages"

interface ClientDetailTabsProps {
  client: Client
  clientId: string
  outstandingPartialBalancePeso: number
  showPackageTransfer: boolean
  canAddProcedureNotes: boolean
}

export default function ClientDetailTabs({
  client,
  clientId,
  outstandingPartialBalancePeso,
  showPackageTransfer,
  canAddProcedureNotes,
}: ClientDetailTabsProps) {
  const [tab, setTab] = useState<TabId>("overview")

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "visits", label: "Visit history" },
    { id: "packages", label: "Packages" },
  ]

  const medical = client.medicalHistory?.trim()
  const allergy = client.allergies?.trim()
  const notes = client.notes?.trim()

  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
      <div className="border-b border-[#e5ded4] px-4 sm:px-6">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Client sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                tab === t.id
                  ? "border-[#6B7A3E] text-[#6B7A3E]"
                  : "border-transparent text-[#6a6358] hover:text-[#314031]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 sm:p-6">
        {tab === "overview" ? (
          <div className="space-y-6">
            <ArAlert totalBalanceDuePeso={outstandingPartialBalancePeso} />

            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6a6358]">
                Medical history
              </h3>
              <p className="whitespace-pre-wrap rounded-lg bg-[#F5F0E8]/60 p-4 text-sm text-[#1f2918]">
                {medical ?? "None recorded"}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6a6358]">
                Allergies
              </h3>
              <p className="whitespace-pre-wrap rounded-lg bg-[#F5F0E8]/60 p-4 text-sm text-[#1f2918]">
                {allergy ?? "None recorded"}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6a6358]">
                Notes
              </h3>
              <p className="whitespace-pre-wrap rounded-lg bg-[#F5F0E8]/60 p-4 text-sm text-[#1f2918]">
                {notes ?? "None recorded"}
              </p>
            </section>
          </div>
        ) : null}

        {tab === "visits" ? (
          <VisitHistoryTable
            clientId={clientId}
            canAddProcedureNotes={canAddProcedureNotes}
          />
        ) : null}

        {tab === "packages" ? (
          <PackageStatusCard
            clientId={clientId}
            showTransfer={showPackageTransfer}
          />
        ) : null}
      </div>
    </div>
  )
}
