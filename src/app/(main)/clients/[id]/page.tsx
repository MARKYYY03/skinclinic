import Link from "next/link"
import { notFound } from "next/navigation"

import PageWrapper from "@/components/layout/PageWrapper"
import ClientProfileCard from "@/components/clients/ClientProfileCard"
import ClientDetailTabs from "@/components/clients/ClientDetailTabs"
import { getServerUserProfile } from "@/lib/auth/server-profile"
import { mapClientRowToClient, type ClientRowDb } from "@/lib/supabase/mappers-client"
import { createServerSupabaseClient } from "@/lib/supabase/server"

interface ClientProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const me = await getServerUserProfile()

  const { data: row } = await supabase
    .from("clients")
    .select(
      "id, full_name, contact_number, email, address, birthdate, gender, medical_history, allergies, notes, category, created_at",
    )
    .eq("id", id)
    .maybeSingle()

  if (!row) notFound()

  const client = mapClientRowToClient(row as unknown as ClientRowDb)

  const { data: partialRows } = await supabase
    .from("transactions")
    .select("balance_due")
    .eq("client_id", id)
    .eq("status", "Partial")

  const outstandingPartialBalancePeso = (partialRows ?? []).reduce(
    (sum, r) => sum + Number(r.balance_due ?? 0),
    0,
  )

  const canEditProfile = me?.role === "Owner" || me?.role === "Admin"
  const showPackageTransfer =
    me?.role === "Owner" || me?.role === "Admin" || me?.role === "Cashier"
  const canAddProcedureNotes =
    me?.role === "Owner" || me?.role === "Admin" || me?.role === "Staff"

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
        </div>

        <ClientProfileCard
          client={client}
          clientId={id}
          showEditLink={Boolean(canEditProfile)}
        />

        <ClientDetailTabs
          client={client}
          clientId={id}
          outstandingPartialBalancePeso={outstandingPartialBalancePeso}
          showPackageTransfer={Boolean(showPackageTransfer)}
          canAddProcedureNotes={Boolean(canAddProcedureNotes)}
        />
      </div>
    </PageWrapper>
  )
}
