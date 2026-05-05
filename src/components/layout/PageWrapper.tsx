interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export default function PageWrapper({
  children,
  className = "",
}: PageWrapperProps) {
  return (
    <div className={`mx-auto max-w-7xl px-6 py-8 ${className}`}>{children}</div>
  )
}
