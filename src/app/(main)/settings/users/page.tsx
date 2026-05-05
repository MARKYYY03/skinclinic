"use client"

import { useState } from "react"
import UserForm from "@/components/settings/UserForm"
import UserTable from "@/components/settings/UserTable"
import { mockCurrentUserRole, mockUsers } from "@/lib/mock/settings"
import { User, UserRole } from "@/types/user"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)

  const handleCreateUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev])
  }

  const handleRoleChange = (userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role } : user)),
    )
  }

  return (
    <div className="space-y-6">
      <UserForm onCreateUser={handleCreateUser} />
      <UserTable
        users={users}
        currentUserRole={mockCurrentUserRole}
        onRoleChange={handleRoleChange}
      />
    </div>
  )
}
