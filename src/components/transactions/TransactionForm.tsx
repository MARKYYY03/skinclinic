"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { createTransactionAction } from "@/lib/actions/transactions"
import PaymentSplitForm from "@/components/transactions/PaymentSplitForm"
import ServiceLineItem from "@/components/transactions/ServiceLineItem"
import { formatCurrency } from "@/lib/utils"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import type { TransactionItem, TransactionPayment } from "@/types/transaction"

type ClientRow = { id: string; name: string; contact: string }
type ServiceRow = { id: string; name: string; price: number }
type StaffRow = { id: string; name: string }
type ClientPackageRow = {
  id: string
  clientId: string
  serviceId: string
  label: string
}

export default function TransactionForm() {
  const router = useRouter()

  const [clients, setClients] = useState<ClientRow[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [staffList, setStaffList] = useState<StaffRow[]>([])
  const [clientPackages, setClientPackages] = useState<ClientPackageRow[]>([])
  const [loadingLookups, setLoadingLookups] = useState(true)

  const [clientSearch, setClientSearch] = useState("")
  const [clientId, setClientId] = useState("")
  const [isWalkIn, setIsWalkIn] = useState(false)
  const [walkInName, setWalkInName] = useState("")
  const [arBalance, setArBalance] = useState(0)

  const [staffIds, setStaffIds] = useState<string[]>([])
  const [items, setItems] = useState<TransactionItem[]>([])
  const [payments, setPayments] = useState<TransactionPayment[]>([
    { method: "Cash", amount: 0 },
  ])
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [notes, setNotes] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const loadLookups = useCallback(async () => {
    setLoadingLookups(true)
    const [{ data: clientRows }, { data: serviceRows }, { data: staffRows }, { data: pkgRows }] =
      await Promise.all([
        supabaseClient
          .from("clients")
          .select("id, full_name, contact_number")
          .eq("is_active", true)
          .order("full_name"),
        supabaseClient
          .from("services")
          .select("id, name, price")
          .eq("is_active", true)
          .order("name"),
        supabaseClient
          .from("profiles")
          .select("id, full_name")
          .eq("role", "Staff")
          .eq("is_active", true)
          .order("full_name"),
        supabaseClient
          .from("client_packages")
          .select(
            "id, client_id, sessions_remaining, expires_at, package_name, service_packages(service_id)",
          )
          .gt("sessions_remaining", 0),
      ])

    setClients(
      (clientRows ?? []).map((row) => ({
        id: row.id,
        name: row.full_name,
        contact: (row.contact_number ?? "").replace(/\s+/g, ""),
      })),
    )
    setServices(
      (serviceRows ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        price: Number(row.price ?? 0),
      })),
    )
    setStaffList(
      (staffRows ?? []).map((row) => ({
        id: row.id,
        name: row.full_name,
      })),
    )

    const pkgs: ClientPackageRow[] = []
    for (const row of pkgRows ?? []) {
      const rel = row.service_packages as { service_id?: string } | { service_id?: string }[] | null
      const sid = Array.isArray(rel) ? rel[0]?.service_id : rel?.service_id
      if (!sid) continue
      pkgs.push({
        id: row.id,
        clientId: row.client_id,
        serviceId: sid,
        label: `${row.package_name} · ${row.sessions_remaining} left (exp. ${row.expires_at?.slice(0, 10) ?? "—"})`,
      })
    }
    setClientPackages(pkgs)
    setLoadingLookups(false)
  }, [])

  useEffect(() => {
    const tid = window.setTimeout(() => {
      void loadLookups()
    }, 0)
    return () => window.clearTimeout(tid)
  }, [loadLookups])

  useEffect(() => {
    let cancelled = false
    const tid = window.setTimeout(() => {
      if (!clientId) {
        if (!cancelled) setArBalance(0)
        return
      }
      void (async () => {
        const { data } = await supabaseClient
          .from("transactions")
          .select("balance_due")
          .eq("client_id", clientId)
          .eq("status", "Partial")
        if (cancelled) return
        const sum = (data ?? []).reduce((s, r) => s + Number(r.balance_due ?? 0), 0)
        setArBalance(sum)
      })()
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(tid)
    }
  }, [clientId])

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase()
    if (!q) return clients.slice(0, 8)
    return clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.contact.toLowerCase().includes(q.replace(/\s+/g, "")),
      )
      .slice(0, 12)
  }, [clientSearch, clients])

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clientId, clients],
  )

  const grossAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  )
  const discountTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.discount * item.quantity, 0),
    [items],
  )
  const netAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items],
  )
  const totalPaid = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments],
  )
  const balanceDue = Math.max(0, Math.round((netAmount - totalPaid) * 100) / 100)

  function packagesForService(serviceId: string): { id: string; label: string }[] {
    if (!clientId || isWalkIn) return []
    return clientPackages
      .filter((p) => p.clientId === clientId && p.serviceId === serviceId)
      .map((p) => ({ id: p.id, label: p.label }))
  }

  function applyRedeem(
    index: number,
    enabled: boolean,
    clientPackageId: string | null,
  ) {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index || it.type !== "service") return it
        const base = it.baseUnitPrice ?? it.unitPrice
        const svc = services.find((s) => s.id === it.referenceId)
        if (!enabled) {
          const qty = Math.max(1, it.quantity)
          return {
            ...it,
            isPackageRedemption: false,
            clientPackageId: null,
            unitPrice: base,
            discount: 0,
            quantity: qty,
            total: qty * base,
            baseUnitPrice: base,
            name: svc?.name ?? it.name.replace(/\s*—\s*package session$/i, ""),
          }
        }
        const pkgId = clientPackageId
        const nameBase = svc?.name ?? it.name
        return {
          ...it,
          isPackageRedemption: true,
          clientPackageId: pkgId,
          baseUnitPrice: base,
          unitPrice: 0,
          discount: 0,
          quantity: 1,
          total: 0,
          name: `${nameBase} — package session`,
        }
      }),
    )
  }

  const addServiceItem = () => {
    if (!selectedServiceId) return
    const service = services.find((s) => s.id === selectedServiceId)
    if (!service) return
    const price = service.price
    const newItem: TransactionItem = {
      type: "service",
      referenceId: service.id,
      name: service.name,
      quantity: 1,
      unitPrice: price,
      baseUnitPrice: price,
      discount: 0,
      total: price,
      isPackageRedemption: false,
      clientPackageId: null,
    }
    setItems((prev) => [...prev, newItem])
    setSelectedServiceId("")
  }

  const updateItem = (index: number, updated: TransactionItem) => {
    setItems((prev) => prev.map((it, i) => (i === index ? updated : it)))
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function toggleStaff(id: string) {
    setStaffIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSubmit() {
    setSubmitError("")
    if (isWalkIn) {
      if (!walkInName.trim()) {
        setSubmitError("Enter walk-in client name.")
        return
      }
    } else if (!clientId) {
      setSubmitError("Select a client or use walk-in.")
      return
    }
    if (items.length === 0) {
      setSubmitError("Add at least one service line.")
      return
    }
    if (staffIds.length === 0) {
      setSubmitError("Assign at least one staff member.")
      return
    }
    if (totalPaid > netAmount + 0.01) {
      setSubmitError("Payments cannot exceed net amount.")
      return
    }
    for (const it of items) {
      if (it.type === "service" && it.isPackageRedemption && !it.clientPackageId) {
        setSubmitError("Select a package for each redemption line.")
        return
      }
    }

    const clientName = isWalkIn
      ? walkInName.trim()
      : selectedClient?.name ?? ""

    setSubmitting(true)
    try {
      const r = await createTransactionAction({
        clientId: isWalkIn ? null : clientId || null,
        clientName,
        totalAmount: grossAmount,
        discountTotal,
        netAmount,
        notes: notes.trim() || null,
        items: items.map((it) => ({
          type: it.type,
          serviceId: it.type === "service" ? it.referenceId : null,
          productId: it.type === "product" ? it.referenceId : null,
          itemName: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
          total: it.total,
          isPackageRedemption: Boolean(it.isPackageRedemption),
          clientPackageId: it.clientPackageId ?? null,
        })),
        payments: payments.filter((p) => p.amount > 0),
        staffIds,
      })
      if (!r.ok) throw new Error(r.error)
      router.push(`/transactions/${r.id}`)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not save transaction.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-[#1f2918]">Client</h3>
        <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-[#314031]">
          <input
            type="checkbox"
            checked={isWalkIn}
            onChange={(e) => {
              const on = e.target.checked
              setIsWalkIn(on)
              if (on) {
                setClientId("")
                setClientSearch("")
              }
            }}
            className="h-4 w-4 rounded border-[#cfc6ba]"
          />
          Walk-in (no saved client)
        </label>

        {isWalkIn ? (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[#314031]">Walk-in name *</span>
            <input
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              className="w-full max-w-md rounded-lg border border-[#cfc6ba] px-3 py-2"
              placeholder="Name for receipt"
            />
          </label>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#314031]">
                Search client by name or phone
              </span>
              <input
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full max-w-md rounded-lg border border-[#cfc6ba] px-3 py-2"
                placeholder="Type to filter…"
              />
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full max-w-md rounded-lg border border-[#cfc6ba] px-3 py-2"
              aria-label="Selected client"
            >
              <option value="">Select client…</option>
              {filteredClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.contact ? ` · ${c.contact}` : ""}
                </option>
              ))}
            </select>
            {selectedClient ? (
              <p className="text-sm text-[#6a6358]">
                Selected: <strong className="text-[#1f2918]">{selectedClient.name}</strong>
              </p>
            ) : null}
          </div>
        )}

        {!isWalkIn && clientId && arBalance > 0 ? (
          <div
            className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
            role="status"
          >
            Outstanding balance on file:{" "}
            <strong>{formatCurrency(arBalance)}</strong> (Partial transactions). Collect or
            note before completing sale.
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-[#1f2918]">Staff</h3>
        <p className="mb-2 text-sm text-[#6a6358]">At least one staff required.</p>
        <div className="flex flex-wrap gap-2">
          {staffList.map((s) => {
            const on = staffIds.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleStaff(s.id)}
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  on
                    ? "border-[#6B7A3E] bg-[#6B7A3E] text-[#F5F0E8]"
                    : "border-[#cfc6ba] text-[#314031] hover:bg-[#F5F0E8]"
                }`}
              >
                {s.name}
              </button>
            )
          })}
        </div>
        {staffIds.length > 0 ? (
          <p className="mt-2 text-xs text-[#6a6358]">
            Selected:{" "}
            {staffIds
              .map((id) => staffList.find((s) => s.id === id)?.name)
              .filter(Boolean)
              .join(", ")}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-[#1f2918]">Services</h3>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            aria-label="Service to add"
            className="min-w-56 rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
          >
            <option value="">Select service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {formatCurrency(s.price)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addServiceItem}
            className="rounded-lg bg-[#6B7A3E] px-3 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
          >
            Add service
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) =>
            item.type === "service" ? (
              <ServiceLineItem
                key={`${item.referenceId}-${index}`}
                item={item}
                index={index}
                onUpdate={updateItem}
                onRemove={removeItem}
                redeemOptions={packagesForService(item.referenceId)}
                onRedeemChange={(enabled, pkgId) => applyRedeem(index, enabled, pkgId)}
              />
            ) : null,
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
        <PaymentSplitForm payments={payments} onChange={setPayments} netAmount={netAmount} />
      </section>

      <section className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-[#1f2918]">Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm"
          placeholder="Optional internal notes…"
        />
      </section>

      <section className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-[#1f2918]">Totals</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[#314031]">
            <span>Gross</span>
            <span>{formatCurrency(grossAmount)}</span>
          </div>
          <div className="flex justify-between text-[#314031]">
            <span>Discounts</span>
            <span>−{formatCurrency(discountTotal)}</span>
          </div>
          <div className="flex justify-between border-t border-[#e5ded4] pt-2 text-base font-semibold text-[#1f2918]">
            <span>Net</span>
            <span>{formatCurrency(netAmount)}</span>
          </div>
          <div className="flex justify-between text-[#314031]">
            <span>Paid</span>
            <span>{formatCurrency(totalPaid)}</span>
          </div>
          <div className="flex justify-between font-medium text-[#1f2918]">
            <span>Balance due</span>
            <span className={balanceDue > 0 ? "text-amber-800" : "text-emerald-800"}>
              {formatCurrency(balanceDue)}
            </span>
          </div>
        </div>
        {submitError ? (
          <p className="mt-3 text-sm text-red-700">{submitError}</p>
        ) : null}
        {loadingLookups ? (
          <p className="mt-2 text-sm text-[#6a6358]">Loading catalog…</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/transactions")}
            className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || loadingLookups}
            onClick={() => void handleSubmit()}
            className="rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save transaction"}
          </button>
        </div>
      </section>
    </div>
  )
}
