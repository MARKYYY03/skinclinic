"use client"

import { useCallback, useEffect, useState } from "react"

import UserEditModal from "@/components/settings/UserEditModal"
import UserForm from "@/components/settings/UserForm"
import UserTable from "@/components/settings/UserTable"
import { useCurrentUser } from "@/lib/auth/current-user"
import { supabaseClient } from "@/lib/supabase/supabase-client"
import type { User, UserRole } from "@/types/user"

export default function UsersPage() {
  const { userId, role: currentUserRole } = useCurrentUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const canManage = currentUserRole === "Owner" || currentUserRole === "Admin"

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: sessionData, error: sessionErr } =
        await supabaseClient.auth.getSession()
      if (sessionErr || !sessionData.session?.access_token) {
        setError("Not authenticated.")
        setUsers([])
        return
      }

      const res = await fetch("/api/admin/user-directory", {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      })

      const json = (await res.json()) as {
        users?: Array<{
          id: string
          full_name: string
          role: UserRole
          is_active: boolean
          created_at: string
          email: string | null
        }>
        error?: string
      }

      if (!res.ok) {
        setError(json.error ?? "Failed to load users.")
        setUsers([])
        return
      }

      setUsers(
        (json.users ?? []).map((row) => ({
          id: row.id,
          name: row.full_name,
          email: row.email ?? undefined,
          role: row.role,
          isActive: row.is_active,
          createdAt: row.created_at,
        })),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users.")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadUsers()
    }, 0)
    return () => window.clearTimeout(id)
  }, [loadUsers])

  const handleCreateUser = async (params: {
    firstName: string
    lastName: string
    email: string
    role: UserRole
    password: string
  }) => {
    if (!canManage) throw new Error("Forbidden.")
    const { data: sessionData, error: sessionErr } =
      await supabaseClient.auth.getSession()
    if (sessionErr || !sessionData.session?.access_token) {
      throw new Error("Not authenticated.")
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({
        email: params.email,
        full_name: `${params.firstName} ${params.lastName}`.trim(),
        role: params.role,
        password: params.password,
      }),
    })

    const json = (await res.json()) as { id?: string; error?: string }
    if (!res.ok) throw new Error(json.error ?? "Failed to add user.")

    await loadUsers()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#1f2918]">User Management</h2>
        <p className="mt-1 text-sm text-[#5c564c]">
          Staff accounts, roles, and access to Relevare.
        </p>
      </div>

      {canManage ? <UserForm onCreateUser={handleCreateUser} /> : null}

      {loading ? (
        <div className="rounded-xl border border-[#dfd8cf] bg-white p-4 shadow-sm">
          <p className="text-sm text-[#6a6358]">Loading users…</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      ) : null}

      <UserTable
        users={users}
        currentUserRole={currentUserRole}
        currentUserId={userId}
        onEditClick={
          currentUserRole === "Owner"
            ? (user) => {
                setEditUser(user)
                setEditOpen(true)
              }
            : undefined
        }
      />

      <UserEditModal
        user={editUser}
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setEditUser(null)
        }}
        onSaved={loadUsers}
      />
    </div>
  )
}
