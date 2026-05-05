"use client"

import { useMemo, useState } from "react"
import AuditLogTable from "@/components/settings/AuditLogTable"
import { mockAuditLogs } from "@/lib/mock/settings"

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState("All")
  const [search, setSearch] = useState("")

  const filteredLogs = useMemo(
    () =>
      mockAuditLogs.filter((log) => {
        const matchAction = actionFilter === "All" || log.actionType === actionFilter
        const normalized = search.trim().toLowerCase()
        const matchSearch =
          !normalized ||
          log.userName.toLowerCase().includes(normalized) ||
          log.affectedEntity.toLowerCase().includes(normalized)
        return matchAction && matchSearch
      }),
    [actionFilter, search],
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
      <AuditLogTable logs={filteredLogs} />
    </div>
  )
}
