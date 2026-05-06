import type { User, UserRole } from "@/types/user"
import { formatDate } from "@/lib/utils"

interface UserTableProps {
  users: User[]
  currentUserRole: UserRole
  currentUserId: string
  onEditClick?: (user: User) => void
}

function roleBadgeClass(role: UserRole): string {
  switch (role) {
    case "Owner":
      return "bg-purple-100 text-purple-900"
    case "Admin":
      return "bg-blue-100 text-blue-900"
    case "Cashier":
      return "bg-emerald-100 text-emerald-900"
    case "Staff":
    default:
      return "bg-[#e8e3dc] text-[#314031]"
  }
}

export default function UserTable({
  users,
  currentUserRole,
  currentUserId,
  onEditClick,
}: UserTableProps) {
  const ownerCanEdit = currentUserRole === "Owner" && Boolean(onEditClick)

  return (
    <div className="overflow-hidden rounded-xl border border-[#dfd8cf] bg-white shadow-sm">
      <table className="min-w-full divide-y divide-[#e5ded4]">
        <thead className="bg-[#F5F0E8]/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Full name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Created at
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5ded4] bg-white">
          {users.map((user) => {
            const isSelf = user.id === currentUserId
            const showEdit = ownerCanEdit && !isSelf

            return (
              <tr key={user.id} className="hover:bg-[#F5F0E8]/40">
                <td className="px-4 py-3 text-sm font-medium text-[#1f2918]">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-sm text-[#314031]">
                  {user.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(user.role)}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      user.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-[#e8e3dc] text-[#5c564c]"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#6a6358]">
                  {user.createdAt ? formatDate(user.createdAt) : "—"}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  {showEdit ? (
                    <button
                      type="button"
                      onClick={() => onEditClick?.(user)}
                      className="font-semibold text-[#6B7A3E] hover:text-[#5a6734]"
                    >
                      Edit
                    </button>
                  ) : (
                    <span className="text-[#9a9288]">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
