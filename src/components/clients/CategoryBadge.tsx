interface CategoryBadgeProps {
  category: "Regular" | "VIP"
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const styles = {
    Regular: "bg-gray-100 text-gray-800",
    VIP: "bg-purple-100 text-purple-800"
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[category]}`}>
      {category}
    </span>
  )
}
