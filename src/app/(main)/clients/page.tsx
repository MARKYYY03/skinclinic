import PageWrapper from "@/components/layout/PageWrapper"
import ClientsListShell from "@/components/clients/ClientsListShell"
import { getServerUserProfile } from "@/lib/auth/server-profile"
import { mapClientRowToClient, type ClientRowDb } from "@/lib/supabase/mappers-client"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient()
  const me = await getServerUserProfile()

  const { data } = await supabase
    .from("clients")
    .select(
      "id, full_name, contact_number, email, address, birthdate, gender, medical_history, allergies, notes, category, created_at",
    )
    .eq("is_active", true)
    .order("full_name", { ascending: true })

  const clients = (data ?? []).map((row) =>
    mapClientRowToClient(row as unknown as ClientRowDb),
  )

  const showAdd = me?.role !== "Staff"

  return (
    <PageWrapper>
      <ClientsListShell clients={clients} showAdd={Boolean(showAdd)} />
    </PageWrapper>
  )
}
