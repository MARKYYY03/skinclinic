"use client"

import Link from "next/link"
import { useState } from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import PackageTable from "@/components/packages/PackageTable"
import SessionProgressBar from "@/components/packages/SessionProgressBar"
import {
  mockClientPackages,
  mockClientsForPackages,
  mockPackageTemplates,
} from "@/lib/mock/phase6"

export default function PackagesPage() {
  const [clientId, setClientId] = useState("")
  const [templateId, setTemplateId] = useState("")

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Packages</h2>
            <p className="mt-1 text-gray-600">
              Manage package templates and assign packages to clients.
            </p>
          </div>
          <Link
            href="/packages/new"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            New Package Template
          </Link>
        </div>

        <PackageTable packages={mockPackageTemplates} />

        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Assign Package to Client</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="rounded border border-gray-300 px-3 py-2"
              aria-label="Select client"
              title="Client selector"
            >
              <option value="">Select client</option>
              {mockClientsForPackages.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              className="rounded border border-gray-300 px-3 py-2"
              aria-label="Select package template"
              title="Package selector"
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
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              disabled={!clientId || !templateId}
            >
              Assign Package
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Assignment UI is ready for backend integration.
          </p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Active Client Packages</h3>
          <div className="mt-3 space-y-3">
            {mockClientPackages.map((clientPackage) => (
              <div key={clientPackage.id} className="rounded border border-gray-200 p-3">
                <p className="font-medium text-gray-900">{clientPackage.packageName}</p>
                <SessionProgressBar
                  totalSessions={clientPackage.totalSessions}
                  sessionsUsed={clientPackage.sessionsUsed}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
