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
  Plugin,
} from "chart.js"
import { formatCurrency } from "@/lib/utils"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface SalesPoint {
  label: string
  amount: number
}

interface SalesChartProps {
  data: SalesPoint[]
  viewType: "weekly" | "monthly"
  onViewTypeChange: (viewType: "weekly" | "monthly") => void
}

export default function SalesChart({ data, viewType, onViewTypeChange }: SalesChartProps) {
  const labels = data.map((point) => point.label)
  const values = data.map((point) => Number(point.amount ?? 0))
  const total = values.reduce((sum, value) => sum + value, 0)
  const isMonthly = viewType === "monthly"
  const displayValues = values.map((value) => (isMonthly && value <= 0 ? 0.1 : value))

  const noDataLabelPlugin: Plugin<"bar"> = {
    id: "monthlyNoDataLabelPlugin",
    afterDatasetsDraw(chart) {
      if (!isMonthly) return
      const { ctx } = chart
      const meta = chart.getDatasetMeta(0)
      const yScale = chart.scales.y
      if (!meta?.data || !yScale) return

      ctx.save()
      ctx.font = "11px sans-serif"
      ctx.fillStyle = "#9a9387"
      ctx.textAlign = "center"

      values.forEach((value, index) => {
        if (value > 0) return
        const element = meta.data[index]
        if (!element) return
        const x = element.x
        const y = yScale.getPixelForValue(0.6)
        ctx.fillText("No data", x, y)
      })
      ctx.restore()
    },
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Sales",
        data: displayValues,
        backgroundColor: displayValues.map((value, index) =>
          isMonthly && values[index] <= 0 ? "rgba(107, 122, 62, 0.18)" : "#6B7A3E",
        ),
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
          callback: (value) => formatCurrency(Math.max(0, Number(value))),
        },
      },
    },
  }

  return (
    <div className="rounded-xl border border-[#dfd8cf] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1f2918]">Sales</p>
          <p className="mt-1 text-xs text-[#6a6358]">
            {viewType === "weekly" ? "This week (Sun-Sat)" : "Jan to Dec"}
          </p>
        </div>
        <div className="flex items-start gap-4">
          <div>
            <p className="mb-1 text-xs text-[#6a6358]">Sales filter</p>
            <select
              value={viewType}
              onChange={(e) => onViewTypeChange(e.target.value as "weekly" | "monthly")}
              className="rounded-lg border border-[#cfc6ba] bg-white px-3 py-2 text-sm font-medium text-[#314031] hover:border-[#b8b0a0]"
              aria-label="Sales chart view"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="text-right">
          <p className="text-sm text-[#6a6358]">Total</p>
          <p className="text-xl font-semibold text-[#1f2918]">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 h-[300px]">
        {total === 0 && viewType === "weekly" ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[#dfd8cf] text-sm text-[#6a6358]">
            No sales found for this period.
          </div>
        ) : (
          <Bar data={chartData} options={options} plugins={[noDataLabelPlugin]} />
        )}
      </div>
    </div>
  )
}
