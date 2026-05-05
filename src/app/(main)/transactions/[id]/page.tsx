import Link from "next/link"
import PageWrapper from "@/components/layout/PageWrapper"
import ReceiptView from "@/components/transactions/ReceiptView"
import { mockTransactions } from "@/lib/mock/transactions"

interface TransactionDetailPageProps {
  params: {
    id: string
  }
}

export default function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const transaction = mockTransactions.find((entry) => entry.id === params.id)

  if (!transaction) {
    return (
      <PageWrapper>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Transaction not found
          </h2>
          <p className="mt-1 text-gray-600">
            No receipt data found for ID: {params.id}
          </p>
          <Link
            href="/transactions"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Transactions
          </Link>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="mb-4">
        <Link href="/transactions" className="text-sm text-blue-600 hover:underline">
          ← Back to Transactions
        </Link>
      </div>
      <ReceiptView transaction={transaction} />
    </PageWrapper>
  )
}
