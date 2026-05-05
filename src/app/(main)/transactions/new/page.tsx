import PageWrapper from "@/components/layout/PageWrapper"
import TransactionForm from "@/components/transactions/TransactionForm"

export default function NewTransactionPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">New Transaction</h2>
          <p className="mt-1 text-gray-600">
            Add services/products, apply package redemption, and split payments.
          </p>
        </div>
        <TransactionForm />
      </div>
    </PageWrapper>
  )
}
