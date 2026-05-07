"use client"

import { Doughnut } from "react-chartjs-2"
import { ArcElement, Chart as ChartJS, Legend, Tooltip, ChartOptions } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

interface PaymentMethodPoint {
  method: "Cash" | "GCash" | "Maya" | "Card" | "BankTransfer" | "HomeCredit"
  count: number
}

interface PaymentMethodsChartProps {
  data: PaymentMethodPoint[]
}

const METHOD_ORDER: PaymentMethodPoint["method"][] = [
  "Cash",
  "GCash",
  "Maya",
  "Card",
  "BankTransfer",
  "HomeCredit",
]

const METHOD_COLORS: Record<PaymentMethodPoint["method"], string> = {
  Cash: "#4f9f46",
  GCash: "#3B82F6",
  Maya: "#8B5CF6",
  Card: "#f59e0b",
  BankTransfer: "#14b8a6",
  HomeCredit: "#ef4444",
}

export default function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const countByMethod = new Map(data.map((entry) => [entry.method, entry.count]))
  const labels = METHOD_ORDER
  const values = METHOD_ORDER.map((method) => countByMethod.get(method) ?? 0)
  const total = values.reduce((sum, value) => sum + value, 0)

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: METHOD_ORDER.map((method) => METHOD_COLORS[method]),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  }

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#6a6358",
          boxWidth: 12,
          boxHeight: 12,
          padding: 12,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label ?? ""
            const value = Number(context.parsed ?? 0)
            return `${label}: ${value}`
          },
        },
      },
    },
  }

  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1f2918]">Payment Methods</p>
          <p className="mt-1 text-xs text-[#6a6358]">This month payment breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#6a6358]">Total</p>
          <p className="text-xl font-semibold text-[#1f2918]">{total}</p>
        </div>
      </div>

      <div className="mt-5 h-[250px]">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[#dfd8cf] text-sm text-[#6a6358]">
            No payment data found this month.
          </div>
        ) : (
          <Doughnut data={chartData} options={options} />
        )}
      </div>
    </div>
  )
}
