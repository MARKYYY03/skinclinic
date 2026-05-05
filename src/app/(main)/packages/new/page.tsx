import PageWrapper from "@/components/layout/PageWrapper"
import PackageForm from "@/components/packages/PackageForm"

export default function NewPackagePage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">New Package Template</h2>
          <p className="mt-1 text-gray-600">Create a package that can be assigned to clients.</p>
        </div>
        <PackageForm mode="create" />
      </div>
    </PageWrapper>
  )
}
