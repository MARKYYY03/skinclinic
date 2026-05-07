export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

/** Ages in full years using calendar date boundaries (Philippines locale-neutral). */
export function ageFromIsoDate(isoLike: string): number | null {
  const trimmed = isoLike.trim()
  if (!trimmed || Number.isNaN(Date.parse(trimmed))) return null
  const dob = new Date(trimmed.includes("T") ? trimmed : `${trimmed}T12:00:00`)
  if (Number.isNaN(+dob)) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1
  return age >= 0 ? age : null
}

export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}
