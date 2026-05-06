import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import PageWrapper from "@/components/layout/PageWrapper"
import EditClientFormClient from "@/components/clients/EditClientFormClient"
import { getServerUserProfile } from "@/lib/auth/server-profile"
import { mapClientRowToClient, type ClientRowDb } from "@/lib/supabase/mappers-client"
import { createServerSupabaseClient } from "@/lib/supabase/server"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: EditPageProps) {
  const { id } = await params
  const me = await getServerUserProfile()
  if (!me) redirect("/login")
  if (me.role !== "Owner" && me.role !== "Admin") redirect(`/clients/${id}`)

  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("clients")
    .select(
      "id, full_name, contact_number, email, address, birthdate, gender, medical_history, allergies, notes, category, created_at",
    )
    .eq("id", id)
    .maybeSingle()

  if (!data) notFound()

  const initialClient = mapClientRowToClient(data as unknown as ClientRowDb)

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <Link
            href={`/clients/${id}`}
            className="text-sm font-medium text-[#6B7A3E] hover:text-[#5a6734]"
          >
            ← Back to profile
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-[#1f2918]">
            Edit client
          </h2>
          <p className="mt-1 text-sm text-[#5c564c]">
            Update demographic and clinical notes for {initialClient.fullName}.
          </p>
        </div>

        <EditClientFormClient clientId={id} initialClient={initialClient} />
      </div>
    </PageWrapper>
  )
}
