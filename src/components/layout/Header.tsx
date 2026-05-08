"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { navigationTitleForPath } from "@/lib/constants"
import ImageModal from "@/components/ImageModal"

interface HeaderProps {
  userName?: string
  userRole?: string
  userId?: string
  onToggleSidebar?: () => void
}

export default function Header({
  userName = "User",
  userRole = "Staff",
  userId = "",
  onToggleSidebar,
}: HeaderProps) {
  const pathname = usePathname()
  const pageTitle = navigationTitleForPath(pathname) ?? "Relevare"
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    if (userId) {
      const savedPhoto = localStorage.getItem(`avatar_${userId}`)
      if (savedPhoto) {
        setUserAvatar(savedPhoto)
      }
    }
  }, [userId])

  return (
    <>
      <header className="border-b border-[#cfd4b8] bg-[#6B7A3E] px-6 py-3 text-[#F5F0E8] shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="mr-4 rounded p-2 hover:bg-black/15 md:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-[28px]">
              {pageTitle}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs opacity-90">{userRole}</p>
            </div>
            {userAvatar ? (
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                aria-label="View your profile photo"
              >
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-9 w-9 shrink-0 rounded-full object-cover border-2 border-white"
                />
              </button>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/15 text-sm font-semibold">
                {userName.trim().slice(0, 1).toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Image Modal */}
      {userAvatar && (
        <ImageModal
          isOpen={showImageModal}
          imageUrl={userAvatar}
          userName={userName}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  )
}
