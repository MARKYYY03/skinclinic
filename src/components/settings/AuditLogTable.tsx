import { formatDate } from "@/lib/utils"
import { AuditLogEntry } from "@/lib/mock/settings"

interface AuditLogTableProps {
  logs: AuditLogEntry[]
}

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Timestamp
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Action
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Entity
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(log.timestamp)}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{log.userName}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{log.actionType}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{log.affectedEntity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
