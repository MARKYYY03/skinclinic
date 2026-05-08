"use client"

import { Pencil, User as UserIcon } from "lucide-react"
import { useState } from "react"
import type { User, UserRole } from "@/types/user"
import { formatDate } from "@/lib/utils"
import ImageModal from "@/components/ImageModal"

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
      return "bg-[#f0ebe1] text-[#314031]"
  }
}

function getUserInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function UserTable({
  users,
  currentUserRole,
  currentUserId,
  onEditClick,
}: UserTableProps) {
  const ownerCanEdit = currentUserRole === "Owner" && Boolean(onEditClick)
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null)

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-[#dfd8cf] bg-white shadow-sm">
        <div className="border-b border-[#e5ded4] bg-[#faf7f0] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6b7a3e]">
                Team members
              </p>
              <p className="text-sm text-[#6a6358]">Manage staff access and account status.</p>
            </div>
            <p className="text-xs text-[#9a9288]">{users.length} users</p>
          </div>
        </div>
        <table className="min-w-full divide-y divide-[#e5ded4]">
          <thead className="bg-[#F5F0E8]/90">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold tracking-wide text-[#5c564c] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ded4] bg-white">
            {users.map((user) => {
              const isSelf = user.id === currentUserId
              const showEdit = ownerCanEdit && !isSelf
              const savedPhoto = typeof window !== "undefined" ? localStorage.getItem(`avatar_${user.id}`) : null

              return (
                <tr key={user.id} className="hover:bg-[#F5F0E8]/50 transition-colors">
                  <td className="px-6 py-4">
                    {savedPhoto ? (
                      <button
                        type="button"
                        onClick={() => setSelectedImage({ url: savedPhoto, name: user.name })}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        aria-label={`View ${user.name}'s photo`}
                      >
                        <img
                          src={savedPhoto}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover border border-[#e5ded4]"
                        />
                      </button>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0ebe1] text-xs font-semibold text-[#6a6358] border border-[#e5ded4]">
                        {getUserInitials(user.name)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1f2918]">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#314031]">{user.email ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClass(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#f0ebe1] text-[#7a6d59]"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6a6358]">{user.createdAt ? formatDate(user.createdAt) : "—"}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    {showEdit ? (
                      <button
                        type="button"
                        onClick={() => onEditClick?.(user)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#d8d0c5] bg-[#f5f0e8] px-3 py-1 text-sm font-medium text-[#4d5c37] hover:border-[#b7b0a4] hover:bg-[#e7e2d7] transition"
                      >
                        <Pencil className="h-3.5 w-3.5" />
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

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          imageUrl={selectedImage.url}
          userName={selectedImage.name}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  )
}
