# Relevare — Copilot Implementation Phases
> Based on: `RELEVARE_USER_GUIDE.md`  
> Stack: Next.js App Router · TypeScript · Tailwind CSS · Supabase  
> MVP Scope: 6 modules (Inventory is Phase 2 — excluded for now)

---

## ⚠️ Read Before Starting

- Always refer to `RELEVARE_SYSTEM_COPILOT.md` for folder structure
- Always refer to `RELEVARE_DATABASE_SUPABASE.md` for table/column names
- Use `@supabase/ssr` — NOT `@supabase/auth-helpers-nextjs`
- All data fetching sa Server Components using `src/lib/supabase/server.ts`
- All mutations (create/update/delete) using Server Actions or Route Handlers
- Use Tailwind only — no external UI libraries unless told
- Olive green (`#6B7A3E`) at cream (`#F5F0E8`) ang brand colors ng Relevare

---

## MVP Modules (In Order)

```
Phase 1 → Auth & Layout
Phase 2 → Profiling System (Clients)
Phase 3 → Organizing System (Services + Staff)
Phase 4 → Sales Log System (Transactions)
Phase 5 → Contract Master (Packages)
Phase 6 → Service/Procedure Log
Phase 7 → Commission Breaker
Phase 8 → Reports & Dashboard
```

---

---

# PHASE 1 — Auth & Layout

## Goal
Mag-setup ng login system at yung main app shell (sidebar + header).

---

## Copilot Prompt — Phase 1A: Login Page

```
Build the login page for Relevare at app/(auth)/login/page.tsx.

Requirements:
- Email and password fields
- "Sign In" button
- On submit, call Supabase Auth signInWithPassword using the browser client 
  from src/lib/supabase/client.ts
- Show inline error message if login fails (e.g. "Invalid email or password")
- Show loading state on button while signing in
- On success, redirect to /dashboard using Next.js router.push()
- No sign up link — accounts are created by admin only
- Style: centered card layout, olive green brand color (#6B7A3E) for button,
  cream background (#F5F0E8), Relevare logo at the top
```

---

## Copilot Prompt — Phase 1B: App Layout (Sidebar + Header)

```
Build the authenticated app shell at app/(main)/layout.tsx.

Requirements:
- Sidebar (src/components/layout/Sidebar.tsx):
  - Relevare logo at the top
  - Navigation links in order:
      Dashboard → /dashboard
      Clients → /clients
      Transactions → /transactions
      Packages → /packages
      Services → /services
      Commissions → /commissions
      Reports (sub-links) → /reports/sales, /reports/commissions
      Settings → /settings/users
  - Active link highlighted (use usePathname)
  - Role-based visibility:
      Staff/Doctor: show Dashboard, Clients (view only), Commissions only
      Cashier: show Dashboard, Clients, Transactions, Packages
      Admin/Owner: show all links
  - Logout button at the bottom — calls supabase.auth.signOut() then 
    redirects to /login

- Header (src/components/layout/Header.tsx):
  - Show current page title (based on route)
  - Show logged-in user's full_name and role from profiles table
  - Olive green top bar

- The layout wraps all (main) children with Sidebar + Header
- Protect all (main) routes — if no session, redirect to /login 
  (this is already handled by middleware.ts)
```

---

---

# PHASE 2 — Profiling System (Clients)

## Goal
Full client management — list, create, view profile, edit.

---

## Copilot Prompt — Phase 2A: Client List Page

```
Build the client list page at app/(main)/clients/page.tsx.

Data: fetch all clients from Supabase `clients` table using server client.
      Order by full_name ASC. Only show is_active = true.

Requirements:
- Page title: "Clients"
- "Add New Client" button (top right) → links to /clients/new
- Search bar — filter by full_name or contact_number (client-side filter on 
  fetched data)
- Filter dropdown — Category: All / Regular / VIP
- Table columns: Full Name, Contact Number, Email, Category (badge), 
  Created At, Actions
- Category badge: VIP = gold/yellow, Regular = gray
- Actions: View button → /clients/[id]
- Empty state: "No clients found" with Add button
- Use src/components/clients/ClientTable.tsx for the table
```

---

## Copilot Prompt — Phase 2B: New Client Form

```
Build the new client form at app/(main)/clients/new/page.tsx.

Requirements:
- Page title: "Add New Client"
- Form fields (all from `clients` table):
    Full Name (text, required)
    Contact Number (text)
    Email (text, email type)
    Address (textarea)
    Birthdate (date picker)
    Gender (select: Male / Female / Other)
    Category (select: Regular / VIP, default Regular)
    Medical History (textarea)
    Allergies (textarea)
    Notes (textarea)
- On submit: insert into `clients` table via Supabase
  Set created_by = current user's profile id
- Success: redirect to /clients/[new client id]
- Error: show inline error message
- Cancel button → back to /clients
- Use src/components/clients/ClientForm.tsx
```

---

## Copilot Prompt — Phase 2C: Client Profile Page

```
Build the client profile page at app/(main)/clients/[id]/page.tsx.

Data: fetch client by id from `clients` table.

Requirements:
- Header card (src/components/clients/ClientProfileCard.tsx):
    Show: Full Name, Category badge, Contact Number, Email, 
    Birthdate (age computed), Gender, Member since date
    Edit button (Admin/Owner only) → opens edit modal or /clients/[id]/edit

- 3 tabs below the header card:

  TAB 1 — Overview:
    - Medical History section
    - Allergies section  
    - Notes section
    - AR Alert banner (src/components/clients/ArAlert.tsx):
      Query SUM of balance_due from `transactions` where client_id = this client
      and status = 'Partial'
      If total > 0 → show red banner: "⚠ Outstanding Balance: ₱{amount}"

  TAB 2 — Visit History:
    - Table of all transactions for this client
    - Columns: Date, Services, Amount, Payment Method, Status, Staff
    - Fetch from `transactions` JOIN `transaction_items` JOIN `transaction_staff`
    - Use src/components/clients/VisitHistoryTable.tsx

  TAB 3 — Packages:
    - List of all client_packages for this client
    - Per package card: package name, service, sessions used / total,
      progress bar (sessions_remaining / total_sessions), 
      expiry date, status (Active/Expired)
    - Use src/components/clients/PackageStatusCard.tsx
    - Transfer button per package (Admin/Owner/Cashier)

- Back button → /clients
```

---

---

# PHASE 3 — Organizing System (Services & Staff)

## Goal
Manage service catalog and staff/user list.

---

## Copilot Prompt — Phase 3A: Services Page

```
Build the services management page at app/(main)/services/page.tsx.

Data: fetch all from `services` table.

Requirements:
- Page title: "Services"
- "Add Service" button (Admin/Owner only)
- Table columns: Name, Category, Price (₱), Commission Rate (%), Status (Active/Inactive)
- Inline edit via modal (Admin/Owner only):
    Fields: Name, Description, Category, Price, Commission Rate, Is Active toggle
    On save: update `services` table
- Deactivate toggle per row (Admin/Owner only)
- Use src/components/services/ServiceTable.tsx
```

---

## Copilot Prompt — Phase 3B: Staff / Users List (Settings)

```
Build the user management page at app/(main)/settings/users/page.tsx.

Data: fetch all from `profiles` table.

Requirements:
- Page title: "User Management" 
- Admin/Owner access only — if role is Cashier or Staff, redirect to /dashboard
- Table columns: Full Name, Email, Role (badge), Status (Active/Inactive), Created At
- Role badges: Owner = purple, Admin = blue, Cashier = green, Staff = gray
- Edit role modal (Owner only):
    Dropdown to change role
    Toggle is_active
    On save: update `profiles` table
- Cannot edit own role
```

---

---

# PHASE 4 — Sales Log System (Transactions)

## Goal
The most important module — daily billing and sales recording.

---

## Copilot Prompt — Phase 4A: Transaction List

```
Build the transaction list at app/(main)/transactions/page.tsx.

Data: fetch from `transactions` table with created_by profile name.
Default filter: today's date (created_at >= start of today).

Requirements:
- Page title: "Transactions"
- "New Transaction" button → /transactions/new
- Filters (top of page):
    Date range picker (default: today)
    Status filter: All / Completed / Partial / Voided
    Search by client name
- Table columns: 
    Date & Time, Client Name, Net Amount (₱), Amount Paid (₱), 
    Balance Due (₱ — red if > 0), Status badge, Cashier, Actions
- Status badges: Completed = green, Partial = yellow, Voided = red/strikethrough
- Actions: View → /transactions/[id]
- Summary row at bottom: Total Net, Total Paid, Total Balance
- Use src/components/transactions/TransactionTable.tsx
```

---

## Copilot Prompt — Phase 4B: New Transaction Form

```
Build the new transaction form at app/(main)/transactions/new/page.tsx.
This is the most complex form in the system — build it carefully.

SECTION 1 — Client Selection:
- Search input with dropdown results from `clients` table (search by name/contact)
- "Walk-in" checkbox — if checked, disable client search and show a text field 
  for walk-in name only
- After selecting client: show their full name and check if they have 
  any outstanding AR balance — if yes, show warning banner

SECTION 2 — Line Items (Services):
- "Add Service" button → opens service picker dropdown from `services` table
- Each service row shows: Service Name, Quantity (number input), 
  Unit Price (auto-filled from service), Discount (₱), Total (computed)
- Remove row button (X)
- If selected client has active packages in `client_packages` table:
  Show "Redeem Package" toggle per service row
  If toggled ON: unit price becomes ₱0, show package selector dropdown
  (only show packages matching the service_id)

SECTION 3 — Staff Assignment:
- Multi-select dropdown from `profiles` table where role = 'Staff'
- At least 1 staff required
- Show selected staff as removable chips/tags

SECTION 4 — Discounts & Totals:
- Show computed: Gross Total, Total Discount, Net Amount
- These update in real-time as user edits line items

SECTION 5 — Payment:
- "Add Payment" button — each row has: Method dropdown + Amount input
- Payment methods: Cash, GCash, Maya, Card, BankTransfer, HomeCredit
- Show: Total Paid (sum of payment rows), Balance Due (Net - Total Paid)
- If Balance Due > 0 → show yellow warning: "Transaction will be saved as Partial"
- If Balance Due = 0 → show green: "Transaction is Fully Paid"

SECTION 6 — Notes:
- Optional textarea

SUBMIT:
On save, insert in this order:
  1. Insert into `transactions` (client_id, client_name, total_amount, 
     discount_total, net_amount, amount_paid, status, notes, created_by)
  2. Insert all rows into `transaction_items`
  3. Insert all rows into `transaction_payments`  
  4. Insert all staff into `transaction_staff`
  5. If any item is package redemption → 
     set is_package_redemption=true, client_package_id on that item
     (trigger will auto-update sessions_used)

On success: redirect to /transactions/[new id]
On error: show error toast, do not redirect

Use src/components/transactions/TransactionForm.tsx
```

---

## Copilot Prompt — Phase 4C: Transaction Detail / Receipt

```
Build the transaction detail page at app/(main)/transactions/[id]/page.tsx.

Data: fetch transaction with all items, payments, and staff.

Requirements:
- Receipt-style layout (src/components/transactions/ReceiptView.tsx):
    Header: Relevare logo, transaction date, transaction ID
    Client name
    Line items table: Item, Qty, Unit Price, Discount, Total
    Package redemptions shown with "Package Session (₱0)" label
    Payment breakdown: per method and amount
    Totals: Gross, Discount, Net, Paid, Balance Due
    Staff assigned: comma-separated names
    Status badge

- Action buttons (top right):
    Print Receipt (window.print() or print-specific CSS)
    Void Transaction (Admin/Owner only — confirm modal first)
      On void: update status = 'Voided' in `transactions`

- Back button → /transactions
```

---

---

# PHASE 5 — Contract Master (Packages)

## Goal
Manage package templates and client package records.

---

## Copilot Prompt — Phase 5A: Package Templates

```
Build the packages page at app/(main)/packages/page.tsx.

Data: fetch from `service_packages` table with joined service name.

Requirements:
- Page title: "Packages"
- "New Package" button (Admin/Owner only) → modal form
- Table columns: Package Name, Service, Sessions, Price (₱), 
  Validity (days), Status
- New/Edit modal fields:
    Package Name (text, required)
    Service (select from active `services`)
    Session Count (select: 3 / 5 / 10 / 15)
    Price (number)
    Validity Days (number, default 365)
    Is Active toggle
- On save: insert or update `service_packages`
- Use src/components/packages/PackageTable.tsx
```

---

## Copilot Prompt — Phase 5B: Package Transfer

```
Add Transfer functionality to the Client Profile Packages tab.

In src/components/clients/PackageStatusCard.tsx:
- Add "Transfer" button per active package (is_transferable = true only)
- Clicking Transfer opens a modal:
    Search input for recipient client (search `clients` table)
    Show recipient client name and current packages
    Confirm button
- On confirm:
    Update `client_packages`: 
      set transferred_to_client = recipient client id
      set is_transferable = false
      set client_id = recipient client id
    Insert into `audit_logs`:
      action = 'UPDATE', table_name = 'client_packages',
      old_data = previous record, new_data = updated record
- Show success toast: "Package transferred successfully"
```

---

---

# PHASE 6 — Service / Procedure Log

## Goal
Per-visit procedure logging — what was done, who did it, what products were used.

---

## Copilot Prompt — Phase 6A: Procedure Log

```
Add procedure logging to the Visit History tab on Client Profile.

Each transaction/visit in the VisitHistoryTable should be expandable 
to show a Procedure Log section.

Procedure log shows per service rendered:
- Service name
- Assigned staff name
- Products used (free text or linked products)
- Procedure notes / observations
- Before/After notes (optional)

Data: fetch from `transaction_items` where item_type = 'service' 
and transaction_id = this visit's transaction id.
Staff from `transaction_staff` table.
Notes from `transactions`.notes field.

Add an "Add Procedure Notes" button per visit row 
(for Staff and Admin — to add post-treatment notes):
- Opens a modal with:
    Notes textarea
    Products Used textarea  
    Observations textarea
- On save: update `transactions`.notes field
  (or create a separate `procedure_logs` table if the team decides)
```

---

---

# PHASE 7 — Commission Breaker

## Goal
Commission viewing per staff per transaction.

---

## Copilot Prompt — Phase 7A: Commission Report Page

```
Build the commissions page at app/(main)/commissions/page.tsx.

Data: 
- If role = Staff: fetch from `commissions` where staff_id = current user id
- If role = Admin/Owner: fetch all from `commissions` with staff name

Requirements:
- Page title: "Commissions"
- Filters:
    Date range (default: current month)
    Staff filter (Admin/Owner only) — select from profiles where role = 'Staff'
- Summary cards at top:
    Total Commission (sum of commission_amount in filter range)
    Total Transactions
    Average per Transaction
- Table columns:
    Date, Client Name, Service/Item, Gross Amount (₱), 
    Rate (%), Pool Share, Commission Earned (₱), Transaction ID (link)
- Total row at bottom
- Export to CSV button (Admin/Owner only)
- Use src/components/commissions/CommissionTable.tsx

Note on commission computation:
Commission is computed and saved during transaction creation.
Formula per staff member:
  commission_amount = net_amount × (commission_rate / 100) × (1 / number_of_staff)
  pool_share = 1 / number_of_staff (e.g. 0.5 if 2 staff)

Add this computation logic to the transaction save flow in Phase 4B:
After inserting transaction_staff, compute and insert into `commissions`
one row per staff member.
```

---

---

# PHASE 8 — Reports & Dashboard

## Goal
Real data on Dashboard KPIs and full Reports module.

---

## Copilot Prompt — Phase 8A: Dashboard with Real Data

```
Update app/(main)/dashboard/page.tsx with real Supabase data.

KPI Cards (src/components/dashboard/KpiCard.tsx):

1. Today's Sales
   SELECT SUM(net_amount) FROM transactions 
   WHERE DATE(created_at) = today AND status != 'Voided'

2. Active Clients
   SELECT COUNT(*) FROM clients WHERE is_active = true

3. Pending AR (Outstanding Balances)
   SELECT SUM(balance_due) FROM transactions WHERE status = 'Partial'
   If > 0 → KPI card color = red/warning

4. Total Commissions (This Month)
   SELECT SUM(commission_amount) FROM commissions
   WHERE created_at >= start of current month

Recent Transactions (src/components/dashboard/RecentTransactions.tsx):
- Last 5 transactions — client name, amount, status, time ago
- Each row links to /transactions/[id]

All data fetched server-side (Server Component).
```

---

## Copilot Prompt — Phase 8B: Sales Report

```
Build the sales report at app/(main)/reports/sales/page.tsx.

Requirements:
- Date range filter (default: current month)
- Summary cards: Total Sales, Total Transactions, Average per Transaction
- Breakdown table by Payment Method:
    Columns: Payment Method, Number of Transactions, Total Amount (₱)
    Data: JOIN transactions + transaction_payments, group by method
- Daily sales table:
    Columns: Date, Transactions Count, Gross, Discount, Net
- Export to CSV button
- Use src/components/reports/SalesReportTable.tsx
```

---

## Copilot Prompt — Phase 8C: Commission Report (Full)

```
Build the full commission report at app/(main)/reports/commissions/page.tsx.

Requirements:
- Date range filter
- Staff filter (all staff from profiles)
- Summary per staff: Name, Total Transactions, Total Commission Earned
- Detail table: same as commissions page but for all staff grouped
- Export to CSV
- Use src/components/reports/CommissionReportTable.tsx
```

---

---

## Summary Table

| Phase | Module | Key Files |
|---|---|---|
| 1A | Login | `(auth)/login/page.tsx` |
| 1B | App Shell | `(main)/layout.tsx`, `Sidebar.tsx`, `Header.tsx` |
| 2A | Client List | `clients/page.tsx`, `ClientTable.tsx` |
| 2B | New Client | `clients/new/page.tsx`, `ClientForm.tsx` |
| 2C | Client Profile | `clients/[id]/page.tsx`, `ClientProfileCard.tsx` |
| 3A | Services | `services/page.tsx` |
| 3B | Users/Staff | `settings/users/page.tsx` |
| 4A | Transaction List | `transactions/page.tsx` |
| 4B | New Transaction | `transactions/new/page.tsx` ⭐ most complex |
| 4C | Transaction Detail | `transactions/[id]/page.tsx` |
| 5A | Package Templates | `packages/page.tsx` |
| 5B | Package Transfer | `ClientPackageCard.tsx` |
| 6A | Procedure Log | `VisitHistoryTable.tsx` (expanded) |
| 7A | Commissions | `commissions/page.tsx` |
| 8A | Dashboard (real data) | `dashboard/page.tsx` |
| 8B | Sales Report | `reports/sales/page.tsx` |
| 8C | Commission Report | `reports/commissions/page.tsx` |

---

## Notes for Copilot

- Phase 4B (New Transaction) is the **most complex** — do it carefully, one section at a time
- Always use `src/lib/supabase/server.ts` for data fetching in page.tsx (Server Components)
- Always use `src/lib/supabase/client.ts` only inside client components with `'use client'`
- Format all peso amounts as `₱` with 2 decimal places using `formatCurrency()` from `src/lib/utils.ts`
- All date displays use `formatDate()` from `src/lib/utils.ts`
- Inventory module is **excluded from MVP** — skip any inventory-related UI for now
