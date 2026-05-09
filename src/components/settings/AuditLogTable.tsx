"use client"

import { useState } from "react"
import { formatDate } from "@/lib/utils"
import { AuditLogEntry } from "@/types/audit-log"
import { Clock, User, Activity, Database } from "lucide-react"
import DataPaginator from "@/components/ui/DataPaginator"

interface AuditLogTableProps {
  logs: AuditLogEntry[]
}

function getActionBadgeClass(action: string): string {
  switch (action) {
    case "Create":
      return "bg-emerald-100 text-emerald-700"
    case "Edit":
      return "bg-blue-100 text-blue-700"
    case "Delete":
      return "bg-red-100 text-red-700"
    case "Login":
      return "bg-purple-100 text-purple-700"
    default:
      return "bg-[#e8e3dc] text-[#314031]"
  }
}

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedLogs = logs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-[#dfd8cf] bg-white px-6 py-12 text-center">
        <Activity className="mx-auto h-10 w-10 text-[#c4bbb0] mb-3" />
        <p className="text-[#6a6358]">No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-0 rounded-xl border border-[#dfd8cf] bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto rounded-b-none">
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timestamp
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Action
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Entity
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4] bg-white">
            {paginatedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F5F0E8]/40 transition-colors">
                <td className="px-6 py-4 text-sm text-[#314031] font-medium">{formatDate(log.timestamp)}</td>
                <td className="px-6 py-4 text-sm text-[#314031]">{log.userName}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getActionBadgeClass(log.actionType)}`}>
                    {log.actionType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[#6a6358] font-mono">{log.affectedEntity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DataPaginator
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={logs.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
