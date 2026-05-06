import Link from "next/link"

import type { Client } from "@/types/client"
import { ageFromIsoDate, formatDate } from "@/lib/utils"
import CategoryBadge from "./CategoryBadge"

interface ClientProfileCardProps {
  client: Client
  clientId: string
  showEditLink?: boolean
}

export default function ClientProfileCard({
  client,
  clientId,
  showEditLink = false,
}: ClientProfileCardProps) {
  const age = ageFromIsoDate(client.birthdate)

  const initials =
    client.fullName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "C"

  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e3ddd3] text-lg font-semibold text-[#314031]">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1f2918]">
              {client.fullName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 gap-y-2 text-sm">
              <CategoryBadge category={client.category} />
              <span className="text-[#6a6358]">{client.gender}</span>
              <span className="text-[#6a6358]">
                Born {formatDate(client.birthdate)}
                {age !== null ? ` (${age} yrs)` : ""}
              </span>
              <span className="text-[#6a6358]">
                Member since {formatDate(client.createdAt)}
              </span>
            </div>
          </div>
        </div>
        {showEditLink ? (
          <Link
            href={`/clients/${clientId}/edit`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#6B7A3E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] hover:bg-[#5a6734]"
          >
            Edit profile
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#e5ded4] pt-6 sm:grid-cols-2">
        <div className="space-y-2 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6a6358]">
            Contact
          </h3>
          <p className="text-[#1f2918]">
            <span className="font-medium text-[#314031]">Phone</span>:{" "}
            {client.contactNumber || "—"}
          </p>
          <p className="text-[#1f2918]">
            <span className="font-medium text-[#314031]">Email</span>:{" "}
            {client.email && client.email !== "—" ? client.email : "—"}
          </p>
          <p className="text-[#1f2918]">
            <span className="font-medium text-[#314031]">Address</span>:{" "}
            {client.address?.trim() || "—"}
          </p>
        </div>
      </div>
    </div>
  )
}
