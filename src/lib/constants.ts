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

// Navigation configuration for role-based access
export const NAVIGATION_ITEMS = [
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
    name: "Transactions",
    href: "/transactions",
    icon: "Receipt",
    roles: ["Owner", "Admin", "Cashier"],
  },
  {
    name: "Packages",
    href: "/packages",
    icon: "Gift",
    roles: ["Owner", "Admin"],
  },
  {
    name: "Commissions",
    href: "/commissions",
    icon: "DollarSign",
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
    name: "Reports",
    href: "/reports/sales",
    icon: "BarChart3",
    roles: ["Owner", "Admin"],
  },
  {
    name: "Settings",
    href: "/settings/users",
    icon: "Settings",
    roles: ["Owner", "Admin"],
  },
] as const
