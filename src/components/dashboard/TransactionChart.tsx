"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface TransactionPoint {
  label: string
  count: number
}

interface TransactionChartProps {
  data: TransactionPoint[]
  viewType: "weekly" | "monthly"
  onViewTypeChange: (viewType: "weekly" | "monthly") => void
}

export default function TransactionChart({
  data,
  viewType,
  onViewTypeChange,
}: TransactionChartProps) {
  const labels = data.map((point) => point.label)
  const values = data.map((point) => Number(point.count ?? 0))
  const total = values.reduce((sum, value) => sum + value, 0)

  const chartData = {
    labels,
    datasets: [
      {
        label: "Transactions",
        data: values,
        borderColor: "#6B7A3E",
        backgroundColor: "rgba(107, 122, 62, 0.2)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 5,
        pointBackgroundColor: "#6B7A3E",
        pointBorderColor: "#6B7A3E",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${Number(context.parsed.y ?? 0)} tx`,
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
        beginAtZero: true,
        grid: {
          color: "#e5ded4",
        },
        ticks: {
          color: "#6a6358",
          precision: 0,
          stepSize: 1,
        },
      },
    },
  }

  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1f2918]">Transactions</p>
          <p className="mt-1 text-xs text-[#6a6358]">
            {viewType === "weekly" ? "This week (Sun-Sat)" : "Jan to Dec"}
          </p>
        </div>
        <div className="flex items-start gap-4">
          <div>
            <p className="mb-1 text-xs text-[#6a6358]">Transactions filter</p>
            <select
              value={viewType}
              onChange={(e) => onViewTypeChange(e.target.value as "weekly" | "monthly")}
              className="rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-sm font-medium text-[#314031] hover:border-[#b8b0a0]"
              aria-label="Transaction chart view"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#6a6358]">Total</p>
            <p className="text-xl font-semibold text-[#1f2918]">{total}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 h-[280px]">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[#dfd8cf] text-sm text-[#6a6358]">
            No transactions found for this period.
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  )
}
