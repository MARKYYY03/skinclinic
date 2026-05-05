import { formatDate, formatCurrency } from "@/lib/utils"

interface Visit {
  id: string
  date: string
  services: string[]
  staff: string[]
  totalAmount: number
  notes?: string
}

interface VisitHistoryTableProps {
  clientId: string
}

export default function VisitHistoryTable({ clientId }: VisitHistoryTableProps) {
  // Mock data - replace with API call
  const mockVisits: Visit[] = [
    {
      id: "1",
      date: "2024-01-25T10:00:00Z",
      services: ["Facial Treatment", "Eyebrow Shaping"],
      staff: ["Dr. Maria Santos"],
      totalAmount: 2500,
      notes: "Client requested gentle treatment"
    },
    {
      id: "2",
      date: "2024-01-15T14:30:00Z",
      services: ["Body Massage", "Foot Spa"],
      staff: ["Therapist Anna"],
      totalAmount: 1800,
      notes: "Regular maintenance session"
    },
    {
      id: "3",
      date: "2024-01-05T09:15:00Z",
      services: ["Hair Treatment"],
      staff: ["Stylist Juan"],
      totalAmount: 1200
    }
  ]

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Visit History</h3>
        <p className="mt-1 text-sm text-gray-600">Recent appointments and services</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Services
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Staff
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {mockVisits.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No visits recorded yet
                </td>
              </tr>
            ) : (
              mockVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {formatDate(visit.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {visit.services.join(", ")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {visit.staff.join(", ")}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(visit.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {visit.notes || "—"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {mockVisits.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Total visits: {mockVisits.length}
            </span>
            <span className="font-medium text-gray-900">
              Total spent: {formatCurrency(mockVisits.reduce((sum, visit) => sum + visit.totalAmount, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
