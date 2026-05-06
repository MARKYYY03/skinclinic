"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { transferClientPackageAction } from "@/lib/actions/packages"
import { formatDate } from "@/lib/utils"
import { supabaseClient } from "@/lib/supabase/client"

interface ClientPackage {
  id: string
  packageName: string
  serviceName: string
  totalSessions: number
  sessionsUsed: number
  sessionsRemaining: number
  purchasedAt: string
  expiresAt: string
  isTransferable: boolean
  transferredToClient: string | null
}

interface PackageStatusCardProps {
  clientId: string
  showTransfer: boolean
}

type RecipientClient = {
  id: string
  fullName: string
}

function packageLifecycleStatus(pkg: ClientPackage): "Active" | "Expired" {
  const expiry = new Date(pkg.expiresAt)
  const now = new Date()
  if (pkg.sessionsRemaining <= 0) return "Expired"
  if (expiry.getTime() < now.getTime()) return "Expired"
  return "Active"
}

export default function PackageStatusCard({
  clientId,
  showTransfer,
}: PackageStatusCardProps) {
  const [packages, setPackages] = useState<ClientPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [transferFor, setTransferFor] = useState<ClientPackage | null>(null)
  const [recipientQuery, setRecipientQuery] = useState("")
  const [recipientResults, setRecipientResults] = useState<RecipientClient[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientClient | null>(null)
  const [recipientPackageCount, setRecipientPackageCount] = useState<number | null>(null)
  const [transferSaving, setTransferSaving] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null)

  const loadPackages = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: pkgError } = await supabaseClient
      .from("client_packages")
      .select(
        "id, package_name, service_name, total_sessions, sessions_used, sessions_remaining, purchased_at, expires_at, is_transferable, transferred_to_client",
      )
      .eq("client_id", clientId)
      .order("purchased_at", { ascending: false })

    if (pkgError || !data) {
      setPackages([])
      setError(pkgError?.message ?? "Failed to load packages.")
      setLoading(false)
      return
    }

    setPackages(
      data.map((row) => ({
        id: row.id,
        packageName: row.package_name,
        serviceName: row.service_name,
        totalSessions: row.total_sessions,
        sessionsUsed: row.sessions_used,
        sessionsRemaining: row.sessions_remaining,
        purchasedAt: row.purchased_at,
        expiresAt: row.expires_at,
        isTransferable: row.is_transferable,
        transferredToClient: row.transferred_to_client,
      })),
    )
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    let cancelled = false
    const timerId = window.setTimeout(() => {
      if (cancelled) return
      void loadPackages()
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timerId)
    }
  }, [loadPackages])

  useEffect(() => {
    if (!transferFor) return

    const normalized = recipientQuery.trim()
    if (normalized.length < 2) {
      return
    }

    let cancelled = false
    const timerId = window.setTimeout(() => {
      void (async () => {
        const { data } = await supabaseClient
          .from("clients")
          .select("id, full_name")
          .eq("is_active", true)
          .neq("id", clientId)
          .or(`full_name.ilike.%${normalized}%,contact_number.ilike.%${normalized}%`)
          .order("full_name")
          .limit(8)

        if (cancelled) return
        setRecipientResults(
          (data ?? []).map((row) => ({
            id: row.id,
            fullName: row.full_name,
          })),
        )
      })()
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timerId)
    }
  }, [clientId, recipientQuery, transferFor])

  async function selectRecipient(client: RecipientClient) {
    setSelectedRecipient(client)
    setRecipientQuery(client.fullName)
    setRecipientResults([])
    const { count } = await supabaseClient
      .from("client_packages")
      .select("id", { count: "exact", head: true })
      .eq("client_id", client.id)
    setRecipientPackageCount(count ?? 0)
  }

  function openTransferModal(pkg: ClientPackage) {
    setTransferFor(pkg)
    setRecipientQuery("")
    setRecipientResults([])
    setSelectedRecipient(null)
    setRecipientPackageCount(null)
    setTransferError(null)
    setTransferSuccess(null)
  }

  function closeTransferModal() {
    setTransferFor(null)
    setRecipientQuery("")
    setRecipientResults([])
    setSelectedRecipient(null)
    setRecipientPackageCount(null)
    setTransferError(null)
  }

  async function confirmTransfer() {
    if (!transferFor || !selectedRecipient) return
    setTransferSaving(true)
    setTransferError(null)
    try {
      const response = await transferClientPackageAction({
        clientPackageId: transferFor.id,
        recipientClientId: selectedRecipient.id,
      })
      if (!response.ok) throw new Error(response.error)

      closeTransferModal()
      setTransferSuccess("Package transferred successfully")
      await loadPackages()
    } catch (e) {
      setTransferError(e instanceof Error ? e.message : "Failed to transfer package.")
    } finally {
      setTransferSaving(false)
    }
  }

  const getProgressPct = (used: number, total: number) => {
    if (total <= 0) return 0
    return Math.min(100, Math.max(0, (used / total) * 100))
  }

  const expiryLabel = (pkg: ClientPackage) => {
    const expiryDate = new Date(pkg.expiresAt)
    const now = new Date()
    const diffDays = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )
    if (diffDays < 0)
      return { text: "Expired date passed", tone: "text-red-700" as const }
    if (diffDays <= 30)
      return {
        text: `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
        tone: "text-amber-700" as const,
      }
    return { text: `Expires ${formatDate(pkg.expiresAt)}`, tone: "text-[#6a6358]" as const }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
      <div className="border-b border-[#e5ded4] px-4 py-4 sm:px-6">
        <h3 className="text-lg font-semibold text-[#1f2918]">Packages</h3>
        <p className="mt-1 text-sm text-[#6a6358]">
          Purchased bundles and remaining sessions
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {transferSuccess ? (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {transferSuccess}
          </p>
        ) : null}
        {error ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="py-10 text-center text-sm text-[#6a6358]">
            Loading packages…
          </p>
        ) : packages.length === 0 ? (
          <div className="py-10 text-center text-sm">
            <p className="text-[#6a6358]">No packages assigned yet.</p>
            <Link
              href={`/clients/${clientId}/packages`}
              className="mt-4 inline-flex text-sm font-semibold text-[#6B7A3E] hover:text-[#5a6734]"
            >
              Go to packages and assignments
            </Link>
          </div>
        ) : (
          <ul className="space-y-5">
            {packages.map((pkg) => {
              const status = packageLifecycleStatus(pkg)
              const expiry = expiryLabel(pkg)
              const consumedPct = getProgressPct(pkg.sessionsUsed, pkg.totalSessions)
              const barTint =
                status === "Expired"
                  ? "bg-gray-400"
                  : consumedPct > 85
                    ? "bg-red-500"
                    : consumedPct > 50
                      ? "bg-amber-500"
                      : "bg-[#6B7A3E]"

              return (
                <li
                  key={pkg.id}
                  className="rounded-xl border border-[#e5ded4] p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-[#1f2918]">
                        {pkg.packageName}
                      </h4>
                      <p className="text-sm text-[#6a6358]">
                        Service: {pkg.serviceName}
                      </p>
                      <p className="text-xs text-[#6a6358]">
                        Purchased {formatDate(pkg.purchasedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-[#F5F0E8] px-2 py-1 text-xs font-semibold capitalize text-[#314031]">
                        {status}
                      </span>
                      <span className={`text-xs font-medium ${expiry.tone}`}>
                        {expiry.text}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-[#314031]">
                      <span>
                        Sessions{" "}
                        <span className="font-semibold">
                          {pkg.sessionsRemaining}
                        </span>{" "}
                        remaining / {pkg.totalSessions} total ({pkg.sessionsUsed}{" "}
                        used)
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#e8e3dc]">
                      <div
                        className={`h-full rounded-full ${barTint}`}
                        style={{ width: `${consumedPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {showTransfer &&
                    pkg.isTransferable &&
                    !pkg.transferredToClient ? (
                      <button
                        type="button"
                        onClick={() => openTransferModal(pkg)}
                        className="inline-flex rounded-lg border border-[#6B7A3E] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B7A3E] hover:bg-[#F5F0E8]"
                      >
                        Transfer
                      </button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {transferFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h4 className="text-base font-semibold text-[#1f2918]">Transfer package</h4>
                <p className="text-sm text-[#6a6358]">{transferFor.packageName}</p>
              </div>
              <button
                type="button"
                onClick={closeTransferModal}
                className="rounded px-2 py-1 text-sm text-[#6a6358] hover:bg-[#F5F0E8]"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">Recipient client</span>
                <input
                  value={recipientQuery}
                  onChange={(event) => {
                    setRecipientQuery(event.target.value)
                    setSelectedRecipient(null)
                    setRecipientPackageCount(null)
                    setTransferError(null)
                  }}
                  placeholder="Search by name or contact"
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>

              {recipientResults.length > 0 ? (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-[#e5ded4]">
                  {recipientResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => void selectRecipient(result)}
                      className="block w-full border-b border-[#f0ebe4] px-3 py-2 text-left text-sm text-[#314031] hover:bg-[#F5F0E8] last:border-b-0"
                    >
                      {result.fullName}
                    </button>
                  ))}
                </div>
              ) : null}

              {selectedRecipient ? (
                <div className="rounded-lg border border-[#dfd8cf] bg-[#F5F0E8]/50 px-3 py-2 text-sm text-[#314031]">
                  <p>
                    Recipient:{" "}
                    <span className="font-semibold">{selectedRecipient.fullName}</span>
                  </p>
                  <p className="text-xs text-[#6a6358]">
                    Current packages: {recipientPackageCount ?? "Loading..."}
                  </p>
                </div>
              ) : null}

              {transferError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {transferError}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeTransferModal}
                className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedRecipient || transferSaving}
                onClick={() => void confirmTransfer()}
                className="rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:opacity-50"
              >
                {transferSaving ? "Transferring..." : "Confirm transfer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
