"use client"

import { useState } from "react"
import { User, UserRole } from "@/types/user"

interface UserFormProps {
  onCreateUser: (user: User) => void
}

const roleOptions: UserRole[] = ["Owner", "Admin", "Cashier", "Staff"]

export default function UserForm({ onCreateUser }: UserFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("Staff")
  const [error, setError] = useState("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.")
      return
    }

    onCreateUser({
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      isActive: true,
    })

    setName("")
    setEmail("")
    setRole("Staff")
    setError("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg bg-white p-5 shadow">
      <h3 className="text-lg font-semibold text-gray-900">Create User</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Full name"
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Select user role"
          title="User role selector"
        >
          {roleOptions.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Add User
        </button>
      </div>
    </form>
  )
}
