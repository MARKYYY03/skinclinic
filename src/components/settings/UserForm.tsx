"use client"

import { useState } from "react"
import { UserRole } from "@/types/user"
import { Plus, X, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

interface UserFormProps {
  onCreateUser: (params: {
    firstName: string
    lastName: string
    email: string
    role: UserRole
    password: string
  }) => Promise<void>
}

const roleOptions: UserRole[] = ["Owner", "Admin", "Cashier", "Staff"]

function getRoleColor(role: UserRole): string {
  switch (role) {
    case "Owner":
      return "bg-purple-50 border-purple-200"
    case "Admin":
      return "bg-blue-50 border-blue-200"
    case "Cashier":
      return "bg-emerald-50 border-emerald-200"
    case "Staff":
      return "bg-[#f5f0e8] border-[#dfd8cf]"
    default:
      return "bg-[#f5f0e8] border-[#dfd8cf]"
  }
}

export default function UserForm({ onCreateUser }: UserFormProps) {
  const [open, setOpen] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("Staff")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.")
      setSuccess("")
      return
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.")
      setSuccess("")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.")
      setSuccess("")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")
    try {
      await onCreateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
        password: password.trim(),
      })
      setSuccess(`${firstName} ${lastName} has been added successfully!`)
      setFirstName("")
      setLastName("")
      setEmail("")
      setRole("Staff")
      setPassword("")
      setTimeout(() => {
        setSuccess("")
        setOpen(false)
      }, 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add user.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-[#dfd8cf] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#1f2918]">Add Staff Member</h3>
            <p className="text-sm text-[#6a6358] mt-1">
              Create a new login account with email and password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setError("")
              setSuccess("")
              setOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl border border-[#dfd8cf]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1f2918]">Add New User</h3>
                <p className="text-sm text-[#6a6358] mt-1">Fill in the details below to create a new account</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setError("")
                  setSuccess("")
                }}
                aria-label="Close add user form"
                className="rounded-lg p-2 text-[#6a6358] hover:bg-[#F5F0E8] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#314031] mb-2">First Name</label>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="John"
                  className="w-full rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm text-[#1f2918] placeholder-[#a89f96] focus:ring-2 focus:ring-[#6B7A3E] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#314031] mb-2">Last Name</label>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm text-[#1f2918] placeholder-[#a89f96] focus:ring-2 focus:ring-[#6B7A3E] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#314031] mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm text-[#1f2918] placeholder-[#a89f96] focus:ring-2 focus:ring-[#6B7A3E] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#314031] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter a strong password"
                    className="w-full rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm text-[#1f2918] placeholder-[#a89f96] focus:ring-2 focus:ring-[#6B7A3E] focus:border-transparent outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6358] hover:text-[#314031]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#314031] mb-2">Role</label>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className={`w-full rounded-lg border px-4 py-2 text-sm text-[#1f2918] focus:ring-2 focus:ring-[#6B7A3E] focus:border-transparent outline-none transition-all ${getRoleColor(role)}`}
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
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setError("")
                  setSuccess("")
                }}
                aria-label="Cancel add user"
                className="rounded-lg border border-[#cfc6ba] px-4 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Adding..." : "Add User"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}
