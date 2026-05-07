"use client"

import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

interface PaymentMethodDatum {
  method: string
  total: number
}

interface PaymentMethodsChartProps {
  data: PaymentMethodDatum[]
}

const COLORS = ["#4f9f46", "#2563eb", "#f97316", "#db2777", "#8b5cf6", "#14b8a6"]

export default function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const total = data.reduce((sum, item) => sum + item.total, 0)
  const labels = data.map((item) => item.method)
  const values = data.map((item) => Number(item.total ?? 0))

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, index) => COLORS[index % COLORS.length]),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  }

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#314031",
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = Number(context.parsed)
            const share = total > 0 ? Math.round((value / total) * 100) : 0
            return `${context.label}: ${value.toLocaleString()} (${share}%)`
          },
        },
      },
    },
  }

  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-[#1f2918]">Payment Methods</p>
        <p className="mt-1 text-xs text-[#6a6358]">Last 30 days</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[180px_auto] md:items-center">
        <div className="relative flex h-44 w-full items-center justify-center">
          {total === 0 ? (
            <div className="flex h-44 w-full items-center justify-center rounded-3xl bg-[#f5f0e8] text-sm text-[#6a6358]">
              No payment amounts recorded in the last 30 days
            </div>
          ) : (
            <div className="h-44 w-full">
              <Doughnut data={chartData} options={options} />
            </div>
          )}
        </div>

        <div className="grid w-full gap-3">
          {data.length === 0 ? (
            <p className="text-sm text-[#6a6358]">No payment data available yet.</p>
          ) : (
            data.map((item, index) => {
              const share = total > 0 ? Math.round((item.total / total) * 100) : 0
              const colorClass = [
                "bg-emerald-500",
                "bg-blue-600",
                "bg-orange-500",
                "bg-pink-600",
                "bg-violet-500",
                "bg-teal-500",
              ][index % 6]

              return (
                <div key={item.method} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8f5ef] px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${colorClass}`} />
                    <div>
                      <p className="text-sm font-semibold text-[#1f2918]">{item.method}</p>
                      <p className="text-xs text-[#6a6358]">{share}%</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#1f2918]">{item.total.toLocaleString()}</p>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
