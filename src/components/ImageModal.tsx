"use client"

import { X } from "lucide-react"

interface ImageModalProps {
  isOpen: boolean
  imageUrl: string
  userName: string
  onClose: () => void
}

export default function ImageModal({
  isOpen,
  imageUrl,
  userName,
  onClose,
}: ImageModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] rounded-xl bg-white overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#1f2918] hover:bg-white transition-colors shadow-lg"
          aria-label="Close image viewer"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Image */}
        <img
          src={imageUrl}
          alt={userName}
          className="h-full w-full object-contain"
        />

        {/* User Name */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-6 py-4">
          <p className="text-sm font-semibold text-white">{userName}</p>
        </div>
      </div>
    </div>
  )
}
