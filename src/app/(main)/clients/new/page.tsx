import Link from "next/link"
import { redirect } from "next/navigation"

import PageWrapper from "@/components/layout/PageWrapper"
import NewClientFormClient from "@/components/clients/NewClientFormClient"
import { getServerUserProfile } from "@/lib/auth/server-profile"

export default async function NewClientPage() {
  const me = await getServerUserProfile()
  if (!me) redirect("/login")
  if (me.role === "Staff") redirect("/clients")

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <Link
            href="/clients"
            className="text-sm font-medium text-[#6B7A3E] hover:text-[#5a6734]"
          >
            ← Back to Clients
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-[#1f2918]">
            Add New Client
          </h2>
          <p className="mt-1 text-sm text-[#5c564c]">
            Create a profile for a new client.
          </p>
        </div>

        <NewClientFormClient />
      </div>
    </PageWrapper>
  )
}
