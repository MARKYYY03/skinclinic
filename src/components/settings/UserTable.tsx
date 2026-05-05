import { User, UserRole } from "@/types/user"

interface UserTableProps {
  users: User[]
  currentUserRole: UserRole
  onRoleChange: (userId: string, role: UserRole) => void
}

const roleOptions: UserRole[] = ["Owner", "Admin", "Cashier", "Staff"]

export default function UserTable({
  users,
  currentUserRole,
  onRoleChange,
}: UserTableProps) {
  const canManageUsers = currentUserRole === "Owner" || currentUserRole === "Admin"

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {canManageUsers ? (
                  <select
                    value={user.role}
                    onChange={(event) =>
                      onRoleChange(user.id, event.target.value as UserRole)
                    }
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                    aria-label={`Role selector for ${user.name}`}
                    title="User role selector"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
