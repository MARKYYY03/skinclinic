"use client"

import { useEffect, useMemo, useState } from "react"
import AuditLogTable from "@/components/settings/AuditLogTable"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import type { AuditLogEntry } from "@/types/audit-log"

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT"

function mapAction(action: AuditAction): AuditLogEntry["actionType"] {
  switch (action) {
    case "CREATE":
      return "Create"
    case "UPDATE":
      return "Edit"
    case "DELETE":
      return "Delete"
    case "LOGIN":
      return "Login"
    case "LOGOUT":
      return "Login"
    default:
      return "Edit"
  }
}

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<AuditLogEntry[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabaseClient
        .from("audit_logs")
        .select("id, user_id, action, table_name, record_id, created_at")
        .order("created_at", { ascending: false })
        .limit(200)

      if (cancelled) return
      if (error) {
        setError(error.message)
        setLogs([])
        setLoading(false)
        return
      }

      const userIds = Array.from(new Set((data ?? []).map((r) => r.user_id).filter(Boolean))) as string[]
      const nameMap = new Map<string, string>()
      if (userIds.length > 0) {
        const { data: profiles } = await supabaseClient
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds)
        ;(profiles ?? []).forEach((p) => nameMap.set(p.id, p.full_name))
      }

      const mapped: AuditLogEntry[] = (data ?? []).map((r) => {
        const entity = r.table_name
          ? `${r.table_name}${r.record_id ? `:${r.record_id}` : ""}`
          : "—"
        const userName = r.user_id ? nameMap.get(r.user_id) ?? "Unknown" : "System"
        return {
          id: r.id,
          userId: r.user_id ?? "",
          userName,
          actionType: mapAction(r.action as AuditAction),
          affectedEntity: entity,
          timestamp: r.created_at,
        }
      })

      setLogs(mapped)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const matchAction = actionFilter === "All" || log.actionType === actionFilter
        const normalized = search.trim().toLowerCase()
        const matchSearch =
          !normalized ||
          log.userName.toLowerCase().includes(normalized) ||
          log.affectedEntity.toLowerCase().includes(normalized)
        return matchAction && matchSearch
      }),
    [actionFilter, logs, search],
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <select
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
          aria-label="Filter audit logs by action"
          title="Audit action filter"
        >
          <option value="All">All Actions</option>
          <option value="Create">Create</option>
          <option value="Edit">Edit</option>
          <option value="Delete">Delete</option>
          <option value="Login">Login</option>
        </select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search user or entity"
          className="rounded border border-gray-300 px-3 py-2"
        />
      </div>
      {loading ? (
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Loading audit logs…</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}
      <AuditLogTable logs={filteredLogs} />
    </div>
  )
}
