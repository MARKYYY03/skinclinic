"use client"

import Link from "next/link"
import type { ServiceListRow } from "@/types/service"
import { formatCurrency } from "@/lib/utils"

interface ServiceCardProps {
  service: ServiceListRow
  canManage: boolean
  onEdit?: (service: ServiceListRow) => void
  onToggleActive?: (service: ServiceListRow) => void
}

export default function ServiceCard({
  service,
  canManage,
  onEdit,
  onToggleActive,
}: ServiceCardProps) {
  return (
    <Link
      href={canManage ? `/services/${service.id}` : "#"}
      passHref
      className="group block rounded-xl border border-[#dfd8cf] bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-[#1f2918]">{service.name}</h3>
          {canManage && service.is_active ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleActive?.(service)
              }}
              className="rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            >
              Active
            </button>
          ) : null}
        </div>

        {service.description && (
          <p className="text-sm text-[#6a6358] line-clamp-3">
            {service.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm text-[#5c564c]">
          <div>
            <span className="font-medium">Category:</span> {service.category ?? "—"}
          </div>
          <div>
            <span className="font-medium">Price:</span> {formatCurrency(service.price)}
          </div>
          <div>
            <span className="font-medium">Commission:</span>
            {Number(service.commission_rate ?? 0)}%
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span className={`${service.is_active
              ? "text-emerald-600"
              : "text-gray-500"} font-medium`}>
              {service.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {canManage && !service.is_active && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive?.(service)
            }}
            className="w-full mt-4 rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm font-medium text-[#6B7A3E] hover:bg-[#F5F0E8]"
          >
            Activate
          </button>
        )}

        {canManage && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(service)
              }}
              className="rounded-lg border border-[#cfc6ba] px-3 py-2 text-sm font-medium text-[#314031] hover:bg-[#F5F0E8]"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </Link>
  )
}