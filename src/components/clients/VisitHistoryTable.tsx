"use client"

import { Fragment, useEffect, useMemo, useState } from "react"

import { updateTransactionProcedureNotesAction } from "@/lib/actions/transactions"
import { formatDate, formatCurrency } from "@/lib/utils"
import { supabaseClient } from "@/lib/supabase/client"
import DataPaginator from "@/components/ui/DataPaginator"

interface VisitRow {
  id: string
  date: string
  services: string[]
  staff: string[]
  amount: number
  paymentMethods: string[]
  status: string
  notes: string | null
  procedureItems: Array<{
    serviceName: string
    assignedStaffName: string
    productsUsed: string
    observations: string
    beforeAfterNotes: string
  }>
}

interface VisitHistoryTableProps {
  clientId: string
  canAddProcedureNotes: boolean
}

export default function VisitHistoryTable({
  clientId,
  canAddProcedureNotes,
}: VisitHistoryTableProps) {
  const [visits, setVisits] = useState<VisitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedVisitIds, setExpandedVisitIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)
  const [procedureNotes, setProcedureNotes] = useState("")
  const [productsUsed, setProductsUsed] = useState("")
  const [observations, setObservations] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setLoading(true)
      const { data: txRows, error: txErr } = await supabaseClient
        .from("transactions")
        .select("id, created_at, net_amount, status, notes")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (cancelled) return

      if (txErr || !txRows?.length) {
        setVisits([])
        setLoading(false)
        return
      }

      const txIds = txRows.map((row) => row.id)

      const [{ data: itemRows }, { data: staffRows }, { data: payRows }] =
        await Promise.all([
          supabaseClient
            .from("transaction_items")
            .select("transaction_id, item_name, item_type")
            .in("transaction_id", txIds),
          supabaseClient
            .from("transaction_staff")
            .select("transaction_id, staff_id")
            .in("transaction_id", txIds),
          supabaseClient
            .from("transaction_payments")
            .select("transaction_id, method, amount")
            .in("transaction_id", txIds),
        ])

      const staffIds = Array.from(new Set((staffRows ?? []).map((r) => r.staff_id)))
      const { data: profiles } = staffIds.length
        ? await supabaseClient
            .from("profiles")
            .select("id, full_name")
            .in("id", staffIds)
        : { data: [] as Array<{ id: string; full_name: string | null }> }

      const nameById = new Map(
        (profiles ?? []).map((p) => [p.id, p.full_name ?? "Unknown staff"]),
      )

      const itemsByTx = new Map<string, string[]>()
      ;(itemRows ?? []).forEach((row) => {
        if (row.item_type !== "service") return
        itemsByTx.set(row.transaction_id, [
          ...(itemsByTx.get(row.transaction_id) ?? []),
          row.item_name,
        ])
      })

      const staffByTx = new Map<string, string[]>()
      ;(staffRows ?? []).forEach((row) => {
        const staffName = nameById.get(row.staff_id) ?? "Unknown staff"
        staffByTx.set(row.transaction_id, [
          ...(staffByTx.get(row.transaction_id) ?? []),
          staffName,
        ])
      })

      const payByTx = new Map<string, string[]>()
      ;(payRows ?? []).forEach((row) => {
        payByTx.set(row.transaction_id, [
          ...(payByTx.get(row.transaction_id) ?? []),
          String(row.method ?? ""),
        ])
      })

      const mapped: VisitRow[] = txRows.map((row) => ({
        id: row.id,
        date: row.created_at,
        services: itemsByTx.get(row.id) ?? [],
        staff: Array.from(new Set(staffByTx.get(row.id) ?? [])),
        amount: Number(row.net_amount ?? 0),
        paymentMethods: Array.from(new Set(payByTx.get(row.id) ?? [])),
        status: row.status ?? "—",
        notes: row.notes ?? null,
        procedureItems:
          (itemsByTx.get(row.id) ?? []).map((serviceName) => ({
            serviceName,
            assignedStaffName: (staffByTx.get(row.id) ?? ["—"]).join(", "),
            productsUsed: row.notes ?? "Not specified",
            observations: row.notes ?? "Not specified",
            beforeAfterNotes: row.notes ?? "Not specified",
          })),
      }))

      if (!cancelled) {
        setVisits(mapped)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [clientId])

  function toggleExpanded(visitId: string) {
    setExpandedVisitIds((prev) =>
      prev.includes(visitId) ? prev.filter((id) => id !== visitId) : [...prev, visitId],
    )
  }

  function openNotesModal(visitId: string, currentNotes: string | null) {
    setEditingVisitId(visitId)
    setProcedureNotes(currentNotes ?? "")
    setProductsUsed("")
    setObservations("")
    setSaveError(null)
  }

  function closeNotesModal() {
    setEditingVisitId(null)
    setProcedureNotes("")
    setProductsUsed("")
    setObservations("")
    setSaveError(null)
  }

  async function saveNotes() {
    if (!editingVisitId) return
    setSaving(true)
    setSaveError(null)
    try {
      const response = await updateTransactionProcedureNotesAction(editingVisitId, {
        procedureNotes,
        productsUsed,
        observations,
      })
      if (!response.ok) throw new Error(response.error)
      setVisits((prev) =>
        prev.map((visit) =>
          visit.id === editingVisitId
            ? { ...visit, notes: procedureNotes.trim() || null }
            : visit,
        ),
      )
      closeNotesModal()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save procedure notes.")
    } finally {
      setSaving(false)
    }
  }

  const totals = useMemo(() => {
    const count = visits.length
    const amount = visits.reduce((sum, v) => sum + v.amount, 0)
    return { count, amount }
  }, [visits])

  const totalPages = Math.max(1, Math.ceil(visits.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedVisits = visits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
      <div className="border-b border-[#e5ded4] px-4 py-4 sm:px-6">
        <h3 className="text-lg font-semibold text-[#1f2918]">Visit history</h3>
        <p className="mt-1 text-sm text-[#6a6358]">
          Transactions tied to this client
        </p>
      </div>

      <div className="overflow-x-auto rounded-b-none">
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/70">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Services
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Payment method
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Staff
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4] bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-[#6a6358]"
                >
                  Loading visits…
                </td>
              </tr>
            ) : paginatedVisits.length === 0 && visits.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-[#6a6358]"
                >
                  No visits recorded yet
                </td>
              </tr>
            ) : paginatedVisits.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-[#6a6358]"
                >
                  No visits on this page
                </td>
              </tr>
            ) : (
              paginatedVisits.map((visit) => (
                <Fragment key={visit.id}>
                  <tr className="hover:bg-[#F5F0E8]/35">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#314031]">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(visit.id)}
                        className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded border border-[#d8d0c5] text-xs text-[#314031] hover:bg-[#F5F0E8]"
                        aria-label="Toggle procedure details"
                        title="Toggle procedure details"
                      >
                        {expandedVisitIds.includes(visit.id) ? "−" : "+"}
                      </button>
                      {formatDate(visit.date)}
                    </td>
                    <td className="max-w-[16rem] px-6 py-4 text-sm text-[#314031]">
                      {visit.services.length ? visit.services.join(", ") : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#1f2918]">
                      {formatCurrency(visit.amount)}
                    </td>
                    <td className="max-w-[10rem] px-6 py-4 text-sm text-[#314031]">
                      {visit.paymentMethods.length
                        ? visit.paymentMethods.join(", ")
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex rounded-full bg-[#F5F0E8] px-2.5 py-0.5 text-xs font-semibold capitalize text-[#314031]">
                        {visit.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="max-w-[14rem] px-6 py-4 text-sm text-[#314031]">
                      {visit.staff.length ? visit.staff.join(", ") : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      {canAddProcedureNotes ? (
                        <button
                          type="button"
                          onClick={() => openNotesModal(visit.id, visit.notes)}
                          className="font-semibold text-[#6B7A3E] hover:text-[#5a6734]"
                        >
                          Add Procedure Notes
                        </button>
                      ) : (
                        <span className="text-[#9a9288]">—</span>
                      )}
                    </td>
                  </tr>
                  {expandedVisitIds.includes(visit.id) ? (
                    <tr className="bg-[#FAF8F4]">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-[#1f2918]">Procedure Log</p>
                          {visit.procedureItems.length ? (
                            <div className="space-y-2">
                              {visit.procedureItems.map((item, idx) => (
                                <div
                                  key={`${visit.id}-item-${idx}`}
                                  className="rounded-lg border border-[#e5ded4] bg-white p-3"
                                >
                                  <p className="text-sm font-medium text-[#1f2918]">
                                    {item.serviceName}
                                  </p>
                                  <p className="mt-1 text-xs text-[#6a6358]">
                                    Staff: {item.assignedStaffName}
                                  </p>
                                  <p className="mt-1 text-xs text-[#6a6358]">
                                    Products used: {item.productsUsed}
                                  </p>
                                  <p className="mt-1 text-xs text-[#6a6358]">
                                    Observations: {item.observations}
                                  </p>
                                  <p className="mt-1 text-xs text-[#6a6358]">
                                    Before/After notes: {item.beforeAfterNotes}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-[#6a6358]">
                              No service procedure items recorded.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totals.count > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5ded4] bg-[#FAF8F4] px-6 py-3 text-sm text-[#314031]">
          <span>Total visits: {totals.count}</span>
          <span className="font-semibold">
            Lifetime net: {formatCurrency(totals.amount)}
          </span>
        </div>
      ) : null}

      {editingVisitId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-xl rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-2">
              <h4 className="text-lg font-semibold text-[#1f2918]">Add Procedure Notes</h4>
              <button
                type="button"
                onClick={closeNotesModal}
                className="rounded px-2 py-1 text-sm text-[#6a6358] hover:bg-[#F5F0E8]"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">Notes</span>
                <textarea
                  value={procedureNotes}
                  onChange={(event) => setProcedureNotes(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">Products Used</span>
                <textarea
                  value={productsUsed}
                  onChange={(event) => setProductsUsed(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#314031]">Observations</span>
                <textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
                />
              </label>

              {saveError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeNotesModal}
                className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveNotes()}
                className="rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save notes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <DataPaginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={visits.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
