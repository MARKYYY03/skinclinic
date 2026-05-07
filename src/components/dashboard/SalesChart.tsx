"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"
import { formatCurrency } from "@/lib/utils"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface SalesPoint {
  label: string
  amount: number
}

interface SalesChartProps {
  data: SalesPoint[]
}

export default function SalesChart({ data }: SalesChartProps) {
  const labels = data.map((point) => point.label)
  const values = data.map((point) => Number(point.amount ?? 0))
  const total = values.reduce((sum, value) => sum + value, 0)

  const chartData = {
    labels,
    datasets: [
      {
        label: "Sales",
        data: values,
        backgroundColor: "#4f9f46",
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 36,
      },
    ],
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${formatCurrency(Number(context.parsed.y))}`,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6a6358",
          autoSkip: true,
          maxTicksLimit: 12,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: "#e5ded4",
        },
        ticks: {
          color: "#6a6358",
          callback: (value) => formatCurrency(Number(value)),
        },
      },
    },
  }

  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1f2918]">Sales</p>
          <p className="mt-1 text-xs text-[#6a6358]">Last 7/30 days</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#6a6358]">Total</p>
          <p className="text-xl font-semibold text-[#1f2918]">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="mt-6 h-[300px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
