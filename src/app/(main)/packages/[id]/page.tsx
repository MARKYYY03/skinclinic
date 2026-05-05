import PageWrapper from "@/components/layout/PageWrapper"
import PackageForm from "@/components/packages/PackageForm"
import { mockPackageTemplates } from "@/lib/mock/phase6"

interface EditPackagePageProps {
  params: {
    id: string
  }
}

export default function EditPackagePage({ params }: EditPackagePageProps) {
  const selectedPackage =
    mockPackageTemplates.find((pkg) => pkg.id === params.id) ?? mockPackageTemplates[0]

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Package Template</h2>
          <p className="mt-1 text-gray-600">Update sessions, price, and validity settings.</p>
        </div>
        <PackageForm mode="edit" initialData={selectedPackage} />
      </div>
    </PageWrapper>
  )
}
