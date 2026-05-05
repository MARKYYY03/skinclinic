import { Product } from "@/types/product"
import { Service } from "@/types/service"

export const mockServices: Array<Service & { durationMinutes: number }> = [
  {
    id: "srv-001",
    name: "Hydra Facial",
    description: "Deep cleansing, hydration, and pore refinement treatment.",
    price: 1800,
    category: "Facial",
    isActive: true,
    durationMinutes: 60,
  },
  {
    id: "srv-002",
    name: "Diamond Peel",
    description: "Exfoliating peel focused on texture and glow.",
    price: 1200,
    category: "Peel",
    isActive: true,
    durationMinutes: 45,
  },
  {
    id: "srv-003",
    name: "Back Acne Treatment",
    description: "Targeted back treatment with anti-inflammatory protocol.",
    price: 2200,
    category: "Body",
    isActive: false,
    durationMinutes: 75,
  },
]

export const mockProducts: Product[] = [
  {
    id: "prd-001",
    name: "Vitamin C Serum",
    sku: "VITC-30ML",
    sellingPrice: 850,
    costPrice: 520,
    stockQuantity: 14,
    lowStockThreshold: 5,
    expirationDate: "2026-09-10",
    supplier: "DermaCare Lab",
  },
  {
    id: "prd-002",
    name: "Sunscreen SPF 50",
    sku: "SUN-50-50ML",
    sellingPrice: 650,
    costPrice: 390,
    stockQuantity: 7,
    lowStockThreshold: 8,
    expirationDate: "2026-07-12",
    supplier: "Skin Essentials Co.",
  },
  {
    id: "prd-003",
    name: "Gentle Gel Cleanser",
    sku: "CLN-GEL-120",
    sellingPrice: 480,
    costPrice: 270,
    stockQuantity: 30,
    lowStockThreshold: 10,
    expirationDate: "2027-01-20",
    supplier: "PureDerm",
  },
]
