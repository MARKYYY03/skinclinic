"use client"

import { Doughnut } from "react-chartjs-2"
import { ArcElement, Chart as ChartJS, Legend, Tooltip, ChartOptions } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

interface ServiceDataPoint {
  name: string
  count: number
}

interface ServicesChartProps {
  data: ServiceDataPoint[]
}

const COLORS = ["#4f9f46", "#3B82F6", "#8B5CF6", "#f59e0b", "#14b8a6", "#ef4444", "#f97316"]

export default function ServicesChart({ data }: ServicesChartProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count)
  const labels = sorted.map((item) => item.name)
  const values = sorted.map((item) => Number(item.count ?? 0))
  const total = values.reduce((sum, value) => sum + value, 0)

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, index) => COLORS[index % COLORS.length]),
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
          <p className="text-sm font-semibold text-[#1f2918]">Services</p>
          <p className="mt-1 text-xs text-[#6a6358]">This month service breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#6a6358]">Total</p>
          <p className="text-xl font-semibold text-[#1f2918]">{total}</p>
        </div>
      </div>

      <div className="mt-5 h-[250px]">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[#dfd8cf] text-sm text-[#6a6358]">
            No service data found this month.
          </div>
        ) : (
          <Doughnut data={chartData} options={options} />
        )}
      </div>
    </div>
  )
}
