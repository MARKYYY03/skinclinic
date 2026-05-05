# Relevare — Copilot Context Document
> **Stack:** Next.js (App Router) · TypeScript · Tailwind CSS  
> **Role:** Frontend Developer  
> **Current Phase:** Phase 1 — Folder Structure & Route Architecture

---

## 1. System Overview

**Relevare** is a web-based **Skincare Boutique Salon & Spa Management System** for a 15-year-old clinic based in Olongapo (Magsaysay branch) with outreach services in La Union. The system digitizes their current manual/spreadsheet-based workflow.

### What the system does:

**Client Profiling**  
The system stores a complete client record per person: full name, contact number, email, address, birthdate, gender, medical history, allergies, and free-text notes. Each client has a unique profile ID and can have multiple visit records over time. Clients can be categorized (VIP, Regular, etc.).

**Services & Procedures**  
The clinic offers a menu of services (skincare treatments, salon services, spa procedures). Each procedure record captures: date and time, assigned staff/doctor, notes, and products used during the session. Procedures are linked to sales transactions for billing.

**Products / Merchandise**  
The clinic sells retail products alongside services. Inventory is tracked with stock levels, expiration dates, supplier information, cost price, and selling price. Low-stock alerts are needed. Expired items are declared as spoilage.

**Sales & Transactions**  
Each transaction can include multiple services, multiple products, or both. Discounts are applied manually. Payment modes include Cash, GCash, Maya, Credit/Debit Card, Bank Transfer, and Home Credit (installment). Partial payments are allowed. One transaction can split across multiple payment methods. Cancellations apply mainly to packages (per-session tracking). Refunds are owner-driven.

**Packages / Contracts**  
Clients can purchase service packages with session limits (3, 5, 10, or 15 sessions) and a 1-year expiry. Remaining sessions are tracked per client per package. Packages can be transferred between clients.

**Commission System**  
Staff earn commission on both services and products. The rate is variable depending on the service type. Commission is calculated per sale using a staff pool-sharing model. Commission reports are generated per staff member.

**Expenses**  
Expense categories include: Operations Expense, Employee Representation, Travel Allowance, and Cost of Sale/Service. Expenses are categorized and tracked.

**Inventory Management**  
Manual and automatic inventory update methods. Tracks stock-in, stock-out, damaged items, and expired items (spoilage). Low-stock alerts are required.

**Reports**  
Reports needed: Daily Sales, Weekly Sales, Monthly Sales, Expense Reports, Profit & Loss, Inventory Reports, and Commission Reports — all filterable by branch, staff, and service.

**User Roles & Access**  
Four roles: Admin, Cashier, Staff/Doctor, and Owner. Role-based access control. Only Admin and Owner can edit or delete records. All actions are traceable via audit logs (edits, deletions, logins).

---

## 2. User Roles

| Role | Permissions |
|---|---|
| **Owner** | Full access to all data, reports, settings, deletions |
| **Admin** | Full operational access — transactions, clients, inventory, commissions |
| **Cashier** | Create/view transactions, process payments |
| **Staff / Doctor** | View own schedule, view assigned client procedures |

---

## 3. Key Data Entities

| Entity | Description |
|---|---|
| `Client` | Patient/customer profile with medical history and visit records |
| `Visit` | A single clinic visit — links client to procedures and transaction |
| `Procedure` | A service rendered — assigned staff, products used, notes |
| `Service` | Service catalog item with name, description, price |
| `Product` | Retail/consumable item — price, stock, expiry, supplier |
| `Transaction` | Billing record — can include multiple services and products |
| `TransactionItem` | Line item on a transaction (service or product) |
| `Payment` | Payment record against a transaction (supports split payments) |
| `Package` | A pre-purchased bundle of sessions for a service |
| `PackageSession` | One session redeemed from a client's active package |
| `Expense` | An operational expense entry with category |
| `Commission` | Computed commission per staff per transaction |
| `InventoryLog` | Stock movement record (in, out, spoilage) |
| `AuditLog` | Trail of user actions (create, edit, delete, login) |
| `User` | System user with role and branch assignment |

---

## 4. Frontend Pages Map

```
/                             → Redirect to /dashboard

/(auth)/login                 → Login page

/(main)/dashboard             → Overview KPIs

/(main)/clients
  /clients                   → Client list with search & filter
  /clients/new               → New client form
  /clients/[id]              → Client profile
  /clients/[id]/visits       → Visit history
  /clients/[id]/packages     → Active packages & remaining sessions

/(main)/services
  /services                  → Service catalog list
  /services/new              → Add service
  /services/[id]             → Edit service

/(main)/products
  /products                  → Product list + stock levels
  /products/new              → Add product
  /products/[id]             → Edit product / view inventory log

/(main)/transactions
  /transactions              → Transaction list (filterable by date, cashier, status)
  /transactions/new          → New transaction (multi-service + multi-product + split payment)
  /transactions/[id]         → Transaction detail / receipt view

/(main)/packages
  /packages                  → All packages (templates)
  /packages/new              → Create package template
  /packages/[id]             → Edit package

/(main)/commissions
  /commissions               → Commission summary per staff

/(main)/expenses
  /expenses                  → Expense list
  /expenses/new              → Log new expense

/(main)/inventory
  /inventory                 → Stock overview
  /inventory/adjustments     → Log stock-in / stock-out / spoilage

/(main)/reports
  /reports/sales             → Daily / Weekly / Monthly sales report
  /reports/expenses          → Expense report
  /reports/profit-loss       → P&L report
  /reports/inventory         → Inventory report
  /reports/commissions       → Commission report per staff

/(main)/settings
  /settings/users            → User management (roles)
  /settings/services         → Service categories
  /settings/audit-log        → Audit trail viewer
```

---

## 5. Folder Structure (Phase 1 Deliverable)

> Using **Next.js App Router** inside `/src/app`.

```
relevare-system/
├── public/
│   └── logo.svg
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout
│   │   ├── page.tsx                            # Redirect → /dashboard
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                      # Auth layout (centered, no sidebar)
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   └── (main)/                             # Protected app shell
│   │       ├── layout.tsx                      # Sidebar + Header wrapper
│   │       │
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       │
│   │       ├── clients/
│   │       │   ├── page.tsx                    # Client list
│   │       │   ├── new/
│   │       │   │   └── page.tsx                # New client form
│   │       │   └── [id]/
│   │       │       ├── page.tsx                # Client profile overview
│   │       │       ├── visits/
│   │       │       │   └── page.tsx            # Visit history
│   │       │       └── packages/
│   │       │           └── page.tsx            # Active packages
│   │       │
│   │       ├── services/
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       │
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       │
│   │       ├── transactions/
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   │   └── page.tsx                # Core billing form
│   │       │   └── [id]/
│   │       │       └── page.tsx                # Receipt / detail view
│   │       │
│   │       ├── packages/
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       │
│   │       ├── commissions/
│   │       │   └── page.tsx
│   │       │
│   │       ├── expenses/
│   │       │   ├── page.tsx
│   │       │   └── new/
│   │       │       └── page.tsx
│   │       │
│   │       ├── inventory/
│   │       │   ├── page.tsx
│   │       │   └── adjustments/
│   │       │       └── page.tsx
│   │       │
│   │       ├── reports/
│   │       │   ├── layout.tsx                  # Reports sub-nav tabs
│   │       │   ├── sales/
│   │       │   │   └── page.tsx
│   │       │   ├── expenses/
│   │       │   │   └── page.tsx
│   │       │   ├── profit-loss/
│   │       │   │   └── page.tsx
│   │       │   ├── inventory/
│   │       │   │   └── page.tsx
│   │       │   └── commissions/
│   │       │       └── page.tsx
│   │       │
│   │       └── settings/
│   │           ├── layout.tsx                  # Settings sub-nav
│   │           ├── users/
│   │           │   └── page.tsx
│   │           ├── services/
│   │           │   └── page.tsx
│   │           └── audit-log/
│   │               └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                     # Nav sidebar with role-based links
│   │   │   ├── Header.tsx                      # Topbar with page title + user info
│   │   │   └── PageWrapper.tsx                 # Consistent page padding/max-width
│   │   │
│   │   ├── ui/                                 # Reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Badge.tsx                       # Role badge, status badge
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── Pagination.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx                     # Today's sales, active clients, etc.
│   │   │   ├── SalesChart.tsx                  # Weekly/monthly trend
│   │   │   ├── LowStockAlert.tsx               # Products below threshold
│   │   │   └── RecentTransactions.tsx
│   │   │
│   │   ├── clients/
│   │   │   ├── ClientTable.tsx
│   │   │   ├── ClientForm.tsx                  # New & edit client form
│   │   │   ├── ClientProfileCard.tsx           # Header card on client detail page
│   │   │   ├── VisitHistoryTable.tsx
│   │   │   ├── PackageStatusCard.tsx           # Remaining sessions + expiry
│   │   │   └── CategoryBadge.tsx               # VIP / Regular badge
│   │   │
│   │   ├── transactions/
│   │   │   ├── TransactionTable.tsx
│   │   │   ├── TransactionForm.tsx             # Multi-item billing form
│   │   │   ├── ServiceLineItem.tsx             # One service row in the form
│   │   │   ├── ProductLineItem.tsx             # One product row in the form
│   │   │   ├── PaymentSplitForm.tsx            # Split payments across methods
│   │   │   ├── DiscountInput.tsx
│   │   │   ├── PackageRedemptionSelect.tsx     # Choose active package to redeem
│   │   │   └── ReceiptView.tsx                 # Print/view receipt layout
│   │   │
│   │   ├── packages/
│   │   │   ├── PackageTable.tsx
│   │   │   ├── PackageForm.tsx
│   │   │   └── SessionProgressBar.tsx          # Visual sessions used/remaining
│   │   │
│   │   ├── inventory/
│   │   │   ├── StockTable.tsx
│   │   │   ├── AdjustmentForm.tsx              # Log stock-in / stock-out / spoilage
│   │   │   ├── ExpiryBadge.tsx                 # Expiring soon / expired
│   │   │   └── LowStockBadge.tsx
│   │   │
│   │   ├── commissions/
│   │   │   ├── CommissionTable.tsx
│   │   │   └── StaffCommissionCard.tsx
│   │   │
│   │   ├── expenses/
│   │   │   ├── ExpenseTable.tsx
│   │   │   └── ExpenseForm.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── SalesReportTable.tsx
│   │   │   ├── ProfitLossTable.tsx
│   │   │   ├── InventoryReportTable.tsx
│   │   │   ├── CommissionReportTable.tsx
│   │   │   ├── ReportFilters.tsx               # Date range + branch + staff filters
│   │   │   └── ExportButton.tsx                # Export to CSV/PDF
│   │   │
│   │   └── settings/
│   │       ├── UserTable.tsx
│   │       ├── UserForm.tsx                    # Assign role to user
│   │       └── AuditLogTable.tsx
│   │
│   ├── lib/
│   │   ├── api/                                # Fetch wrapper functions per resource
│   │   │   ├── clients.ts
│   │   │   ├── transactions.ts
│   │   │   ├── services.ts
│   │   │   ├── products.ts
│   │   │   ├── packages.ts
│   │   │   ├── commissions.ts
│   │   │   ├── expenses.ts
│   │   │   ├── inventory.ts
│   │   │   └── reports.ts
│   │   ├── utils.ts                            # formatCurrency, formatDate, cn()
│   │   └── constants.ts                        # PAYMENT_METHODS, ROLES, EXPENSE_CATEGORIES, etc.
│   │
│   ├── types/
│   │   ├── client.ts
│   │   ├── transaction.ts
│   │   ├── service.ts
│   │   ├── product.ts
│   │   ├── package.ts
│   │   ├── commission.ts
│   │   ├── expense.ts
│   │   ├── inventory.ts
│   │   ├── report.ts
│   │   └── user.ts
│   │
│   └── hooks/
│       ├── useClients.ts
│       ├── useTransactions.ts
│       ├── useProducts.ts
│       ├── usePackages.ts
│       └── useInventory.ts
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. TypeScript Interfaces (Seed for `/src/types/`)

```ts
// types/client.ts
export interface Client {
  id: string
  fullName: string
  contactNumber: string
  email: string
  address: string
  birthdate: string           // ISO date string
  gender: 'Male' | 'Female' | 'Other'
  medicalHistory?: string
  allergies?: string
  notes?: string
  category: 'Regular' | 'VIP'
  createdAt: string
}

// types/service.ts
export interface Service {
  id: string
  name: string
  description?: string
  price: number
  category: string
  isActive: boolean
}

// types/product.ts
export interface Product {
  id: string
  name: string
  sku?: string
  sellingPrice: number
  costPrice: number
  stockQuantity: number
  lowStockThreshold: number
  expirationDate?: string
  supplier?: string
}

// types/transaction.ts
export type PaymentMethod = 'Cash' | 'GCash' | 'Maya' | 'Card' | 'BankTransfer' | 'HomeCredit'

export interface TransactionItem {
  type: 'service' | 'product'
  referenceId: string         // service or product ID
  name: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface TransactionPayment {
  method: PaymentMethod
  amount: number
}

export interface Transaction {
  id: string
  clientId: string
  clientName: string
  items: TransactionItem[]
  payments: TransactionPayment[]
  totalAmount: number
  discountTotal: number
  netAmount: number
  staffIds: string[]
  notes?: string
  status: 'Completed' | 'Partial' | 'Voided'
  createdBy: string
  createdAt: string
}

// types/package.ts
export interface ServicePackage {
  id: string
  name: string
  serviceId: string
  sessionCount: number        // 3 | 5 | 10 | 15
  price: number
  validityDays: number        // default 365 (1 year)
}

export interface ClientPackage {
  id: string
  clientId: string
  packageId: string
  packageName: string
  totalSessions: number
  sessionsUsed: number
  sessionsRemaining: number
  purchasedAt: string
  expiresAt: string
  isTransferable: boolean
  transferredToClientId?: string
}

// types/expense.ts
export type ExpenseCategory = 'Operations' | 'EmployeeRepresentation' | 'TravelAllowance' | 'CostOfService'

export interface Expense {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  date: string
  recordedBy: string
}

// types/user.ts
export type UserRole = 'Owner' | 'Admin' | 'Cashier' | 'Staff'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
}
```

---

## 7. Constants (`/src/lib/constants.ts`)

```ts
export const PAYMENT_METHODS = ['Cash', 'GCash', 'Maya', 'Card', 'BankTransfer', 'HomeCredit'] as const

export const USER_ROLES = ['Owner', 'Admin', 'Cashier', 'Staff'] as const

export const CLIENT_CATEGORIES = ['Regular', 'VIP'] as const

export const PACKAGE_SESSION_OPTIONS = [3, 5, 10, 15] as const

export const EXPENSE_CATEGORIES = [
  'Operations',
  'EmployeeRepresentation',
  'TravelAllowance',
  'CostOfService',
] as const

export const INVENTORY_ADJUSTMENT_TYPES = ['StockIn', 'StockOut', 'Spoilage', 'Damaged'] as const
```

---

## 8. Phasing Plan

### ✅ Phase 1 — Folder Structure & Route Scaffolding (CURRENT)
> **Goal:** Copilot generates all folders, placeholder pages, empty component stubs, TypeScript interfaces, and constants. Zero logic — just the skeleton.

**Copilot instruction:**
```
Create the full Next.js App Router folder structure as defined in Section 5.

For every page.tsx: export a default React component that returns a <div> 
  with the route name as text (e.g. <div>Clients Page</div>).

For every component file: export an empty functional component stub with 
  typed props (use `{}` if no props needed yet).

Create all TypeScript interfaces in /src/types/ exactly as shown in Section 6.

Create /src/lib/constants.ts with the constants from Section 7.

Create /src/lib/utils.ts with three empty exported functions: 
  formatCurrency(amount: number): string,
  formatDate(date: string): string,
  and cn(...classes: string[]): string.

Create /src/lib/api/ with one empty exported async function per file 
  (e.g. getClients, createClient in clients.ts).

Set up /src/hooks/ with one empty custom hook stub per file.
```

---

### Phase 2 — Layout & Navigation
> Build Sidebar, Header, and the (main) route group layout.

- Role-based sidebar — different nav links visible per role
- Active link highlighting using `usePathname()`
- Responsive/collapsible sidebar for smaller screens
- Header with current page title, user avatar, and logout

---

### Phase 3 — Client Module
> Most pain point: "Finding client form" — this is the #1 priority after layout.

- Searchable, paginated client list table
- Full client creation form (all fields from Section 3)
- Client profile page: header card + tabbed content (Overview, Visits, Packages)
- Visit history table showing date, services, amount, attending staff
- Active packages panel with session progress bar and expiry countdown

---

### Phase 4 — Transaction / Billing Module
> Core daily workflow — replaces manual sales encoding.

- New transaction form:
  - Client search/select (or walk-in)
  - Add service line items (service picker + quantity + discount)
  - Add product line items (product picker + quantity + discount)
  - Package redemption: if client has an active package, option to redeem a session (auto-fill price as ₱0)
  - Payment section: split across multiple payment methods (sum must equal net amount)
  - Totals: gross, discount, net
- Transaction list with date filter, status filter, cashier filter
- Receipt view / print layout per transaction

---

### Phase 5 — Inventory Module
> Pain point: "Maintaining inventory count, separating supply"

- Stock overview table with low-stock and expiry badges
- Stock-in / stock-out / spoilage adjustment form
- Inventory log per product showing all movements

---

### Phase 6 — Packages, Commissions & Expenses
- Package template management (create/edit)
- Assign package to client from transaction or client profile
- Commission report: per staff, per period — shows pool split per transaction
- Expense log with category filter and monthly totals

---

### Phase 7 — Reports
- Sales Report: daily/weekly/monthly with payment method breakdown
- P&L: total revenue minus total expenses per period
- Inventory Report: current stock snapshot + spoilage summary
- Commission Report: per staff with drill-down per transaction
- All reports have a date range filter and export button (CSV)

---

### Phase 8 — Settings, Users & Audit Log
- User management: create user, assign role
- Role-based access enforcement (hide/show nav and actions per role)
- Audit log viewer: filterable table of all system actions

---

## 9. Key Business Rules for UI

1. **Package redemption** — when a client redeems a package session during a transaction, the service price line shows ₱0 (already paid). Display remaining sessions after redemption.

2. **Split payments** — the payment section in a transaction allows adding multiple rows (e.g., ₱500 Cash + ₱300 GCash). The sum of all payment rows must equal the net amount. Validate before submitting.

3. **Low-stock alert** — on the inventory list and on the dashboard, flag products where `stockQuantity <= lowStockThreshold`. Use a visual badge (e.g., red "Low Stock").

4. **Expiry warning** — products expiring within 30 days get a yellow badge. Products already expired get a red badge. Show these prominently on the inventory page.

5. **Spoilage / expired items** — when logging a stock-out as "Spoilage", capture the quantity and reason. This reduces stock and shows up in the inventory report.

6. **Commission pool split** — when multiple staff are assigned to a transaction item, the commission is divided equally among them. Display each staff member's share in the commission report.

7. **Package transfer** — on the client packages tab, allow a "Transfer" action that assigns the package (and remaining sessions) to another client. Log this in the audit trail.

8. **Role-based sidebar** — Owner sees all nav items. Admin sees all except maybe financial settings. Cashier sees only Transactions and basic client lookup. Staff/Doctor sees only their assigned clients and procedures.

9. **Audit trail** — every create, edit, delete, and login action must be logged with: user ID, action type, affected entity, timestamp. Show this in Settings → Audit Log (Admin/Owner only).

10. **Partial payment** — a transaction can be saved in "Partial" status if payment received is less than total. The remaining balance shows on the client profile as an outstanding amount.
