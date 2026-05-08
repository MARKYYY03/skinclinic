export const PAYMENT_METHODS = [
  "Cash",
  "GCash",
  "Maya",
  "Card",
  "BankTransfer",
  "HomeCredit",
] as const

export const USER_ROLES = ["Owner", "Admin", "Cashier", "Staff"] as const

export const CLIENT_CATEGORIES = ["Regular", "VIP"] as const

export const PACKAGE_SESSION_OPTIONS = [3, 5, 10, 15] as const

export const EXPENSE_CATEGORIES = [
  "Operations",
  "EmployeeRepresentation",
  "TravelAllowance",
  "CostOfService",
] as const

export const INVENTORY_ADJUSTMENT_TYPES = [
  "StockIn",
  "StockOut",
  "Spoilage",
  "Damaged",
] as const

export type NavChildItem = {
  readonly name: string
  readonly href: string
  readonly roles?: readonly string[]
}

export type NavItem = {
  readonly name: string
  readonly href?: string
  readonly icon: string
  readonly roles: readonly string[]
  readonly children?: readonly NavChildItem[]
}

/** Phase 1 order; role visibility per RELEVARE_COPILOT_PHASES.md (+ Settings/profile for Staff/Cashier). */
export const NAVIGATION_ITEMS: readonly NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["Owner", "Admin", "Cashier", "Staff"],
  },
  {
    name: "Clients",
    href: "/clients",
    icon: "Users",
    roles: ["Owner", "Admin", "Cashier", "Staff"],
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: "Receipt",
    roles: ["Owner", "Admin", "Cashier"],
  },
  {
    name: "Packages",
    href: "/packages",
    icon: "Gift",
    roles: ["Owner", "Admin", "Cashier"],
  },
  {
    name: "Services",
    href: "/services",
    icon: "Scissors",
    roles: ["Owner", "Admin"],
  },
  {
    name: "Products",
    href: "/products",
    icon: "Package",
    roles: ["Owner", "Admin"],
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: "Wallet",
    roles: ["Owner", "Admin"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: "Archive",
    roles: ["Owner", "Admin"],
  },
  {
    name: "Commissions",
    href: "/commissions",
    icon: "DollarSign",
    roles: ["Owner", "Admin", "Staff"],
  },
  {
    name: "Reports",
    icon: "BarChart3",
    roles: ["Owner", "Admin"],
    children: [
      { name: "Sales", href: "/reports/sales" },
      { name: "Commissions", href: "/reports/commissions" },
    ],
  },
  {
    name: "Settings",
    icon: "Settings",
    roles: ["Owner", "Admin", "Cashier", "Staff"],
    children: [
      { name: "Profile", href: "/settings/profile" },
      { name: "Users", href: "/settings/users", roles: ["Owner", "Admin"] },
      { name: "Audit Log", href: "/settings/audit-log", roles: ["Owner", "Admin"] },
    ],
  },
]

/** Page title shown in Header for a pathname (handles nested Reports). */
export function navigationTitleForPath(pathname: string): string | undefined {
  for (const item of NAVIGATION_ITEMS) {
    if (item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`))) {
      return item.name
    }
    if (item.children) {
      for (const child of item.children) {
        if (pathname === child.href || pathname.startsWith(`${child.href}/`)) {
          return child.name
        }
      }
    }
  }
  return undefined
}
