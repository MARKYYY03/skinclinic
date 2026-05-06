interface KpiCardProps {
  title: string
  value: string
  tone?: "default" | "warning"
}

export default function KpiCard({ title, value, tone = "default" }: KpiCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        tone === "warning"
          ? "border-red-200 bg-red-50"
          : "border-[#dfd8cf] bg-white"
      }`}
    >
      <p className={`text-xs ${tone === "warning" ? "text-red-700" : "text-[#6a6358]"}`}>
        {title}
      </p>
      <p className={`mt-1 text-2xl font-bold ${tone === "warning" ? "text-red-800" : "text-[#1f2918]"}`}>
        {value}
      </p>
    </div>
  )
}
