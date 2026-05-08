"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import { X } from "lucide-react"

interface LogoutDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function LogoutDialog({
  isOpen,
  onConfirm,
  onCancel,
}: LogoutDialogProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="relative max-w-sm w-full rounded-xl bg-white shadow-2xl border border-[#dfd8cf]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 z-10 rounded-full bg-[#F5F0E8] p-2 text-[#1f2918] hover:bg-[#ebe6dd] transition-colors"
          aria-label="Close logout dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Dialog Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#1f2918] mb-2">
              Confirm Logout
            </h3>
            <p className="text-sm text-[#6a6358]">
              Are you sure you want to logout? You will need to sign in again to access your account.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              className="flex-1 bg-[#F5F0E8] text-[#1f2918] hover:bg-[#ebe6dd] border border-[#dfd8cf]"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-[#6B7A3E] text-white hover:bg-[#5a6a3e]"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}