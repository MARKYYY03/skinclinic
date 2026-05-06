export type ServiceListRow = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  commission_rate: number | null
  is_active: boolean
}
