import PageWrapper from "@/components/layout/PageWrapper"
import ExpenseForm from "@/components/expenses/ExpenseForm"

export default function NewExpensePage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">New Expense</h2>
          <p className="mt-1 text-gray-600">Record an operational cost entry.</p>
        </div>
        <ExpenseForm />
      </div>
    </PageWrapper>
  )
}
