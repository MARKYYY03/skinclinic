import PageWrapper from "@/components/layout/PageWrapper"
import PackageForm from "@/components/packages/PackageForm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

interface EditPackagePageProps {
  params: Promise<{ id: string }>
}

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("service_packages")
    .select("id, name, service_id, session_count, price, validity_days")
    .eq("id", id)
    .maybeSingle()

  const selectedPackage = data
    ? {
        id: data.id,
        name: data.name,
        serviceId: data.service_id,
        sessionCount: data.session_count,
        price: Number(data.price ?? 0),
        validityDays: data.validity_days,
      }
    : undefined

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Package Template</h2>
          <p className="mt-1 text-gray-600">Update sessions, price, and validity settings.</p>
        </div>
        {selectedPackage ? <PackageForm mode="edit" initialData={selectedPackage} /> : null}
      </div>
    </PageWrapper>
  )
}
