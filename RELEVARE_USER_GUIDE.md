# Relevare Skincare Boutique Salon & Spa
## System User Guide

---

## What is this system?

Ang **Relevare System** ay isang web-based management system para sa clinic operations ng Relevare Skincare Boutique Salon & Spa. Pinapalitan nito ang manual na pag-encode sa papel at spreadsheet — lahat ng client records, transactions, packages, inventory, at commissions ay naka-store na dito sa isang place.

---

## User Roles

May **4 na roles** sa system. Ang makikita mo at magagawa mo depende sa role na naka-assign sa iyo.

| Role | Sino ito |
|---|---|
| 👑 **Owner** | Full access sa lahat — reports, settings, deletions |
| 🛠️ **Admin** | Full operations — clients, transactions, inventory, commissions |
| 💳 **Cashier** | Mag-create ng transactions, client lookup, payments |
| 💆 **Staff / Doctor** | View lang ng assigned clients at sariling commissions |

---

## How to Log In

1. Buksan ang system sa browser
2. Ilagay ang iyong **email** at **password**
3. Click **Sign In**
4. Ire-redirect ka sa **Dashboard** agad

> Kung first time mo mag-login, hintayin ang Admin na bigyan ka ng account. Hindi ka makakapag-register ng sarili mo.

---

## Dashboard

Ang Dashboard ay ang unang makikita mo pagka-login. Ito ang **overview ng buong clinic operations**.

### Makikita dito:
- **Today's Sales** — total sales ngayong araw
- **Active Clients** — bilang ng clients sa system
- **Pending Balances (AR)** — clients na may hindi pa nababayarang balance
- **Total Commissions (This Month)** — total commissions for current month
- **Recent Transactions** — pinakabagong transactions ngayong araw

---

## Clients Module

### Para saan?
Para sa **pag-manage ng lahat ng client records** ng clinic — personal info, medical history, visit history, at active packages.

---

### Paano magdagdag ng bagong client

1. Pumunta sa **Clients** sa sidebar
2. Click **Add New Client**
3. Punan ang form:
   - Full Name *(required)*
   - Contact Number
   - Email
   - Address
   - Birthdate
   - Gender
   - Category — `Regular` o `VIP`
   - Medical History *(allergies, skin conditions, etc.)*
   - Notes
4. Click **Save**

---

### Paano maghanap ng client

- May **search bar** sa tuktok ng client list
- Pwedeng mag-search by **name** o **contact number**
- May filter din by **Category** (Regular / VIP)

---

### Client Profile Page

Kapag na-click mo ang isang client, makikita mo ang kanyang full profile:

**Overview Tab**
- Personal information
- Medical history, allergies, at notes
- AR alert kapag may outstanding Partial transactions

**Visits Tab**
- Lahat ng nakaraang visits ng client
- Per visit: date, services, amount, payment methods, status, at assigned staff
- Expandable **Procedure Log** per visit
- **Add Procedure Notes** button (Staff/Admin/Owner)

**Packages Tab**
- Active packages ng client
- Sessions used vs remaining (may progress bar)
- Expiry date ng package
- Transfer button for transferable packages (Owner/Admin/Cashier)

---

## Transactions Module

### Para saan?
Ito ang **pinaka-importante na parte ng system** — dito nire-record ang bawat sale, service, at payment ng clinic araw-araw.

---

### Paano gumawa ng bagong transaction

1. Pumunta sa **Transactions** sa sidebar
2. Click **New Transaction**
3. Punan ang form:

**Step 1 — Piliin ang Client**
- Mag-search ng existing client
- O pumili ng **Walk-in** kung hindi naka-register

**Step 2 — Dagdagan ng Services**
- Click **Add Service** — piliin sa service list, lagay ang quantity at discount kung meron

**Step 3 — Package Redemption** *(kung may active package ang client)*
- May lalabas na option na **"Redeem Package Session"**
- Piliin kung aling package ang ire-redeem
- Ang price ng service ay magiging **₱0** (libre na kasi nabayaran na sa package)
- Automatic na mag-a-update ang sessions remaining ng client

**Step 4 — Discounts**
- Pwedeng mag-lagay ng discount per line item
- Makikita ang gross total, discount, at **net amount**

**Step 5 — Payment**
- Piliin ang payment method: `Cash`, `GCash`, `Maya`, `Card`, `Bank Transfer`, `Home Credit`
- **Split Payment** — pwedeng hatiin sa maraming methods (e.g. ₱500 Cash + ₱300 GCash)
- Pwedeng kulang ang payment (partial payment supported)
- Kung hindi kumpleto ang payment → transaction status ay magiging **Partial** (may remaining balance ang client)

4. Click **Save Transaction**

---

### Transaction Status

| Status | Meaning |
|---|---|
| ✅ **Completed** | Fully paid |
| 🟡 **Partial** | May remaining balance pa ang client |
| ❌ **Voided** | Cancelled transaction (Admin/Owner only) |

---

### Transaction List

- Default view: **Transactions ngayong araw**
- May filter by: **Date range**, **Status**, **Client name**
- Click any transaction to view details or print receipt
- May summary totals sa ibaba: Net, Paid, Balance

---

## Packages Module

### Para saan?
Para sa **pag-manage ng package templates** na pwedeng ibenta sa clients (e.g. "10 Sessions Facial for ₱5,000").

---

### Package Templates (Admin/Owner only)

1. Pumunta sa **Packages** sa sidebar
2. Click **New Package**
3. Punan:
   - Package Name (e.g. "Facial Promo 10 Sessions")
   - Service na kasama
   - Bilang ng sessions: `3`, `5`, `10`, o `15`
   - Price
   - Validity: default 1 year (365 days)
4. Click **Save**

---

### Pag-assign ng Package sa Client

Sa kasalukuyang flow, package assignment ay ginagawa sa **Client Packages** page:

1. Pumunta sa client profile
2. Open ang route na **Client Packages**
3. Piliin ang package template
4. Click assign
5. Makikita ito sa **Client Profile → Packages tab**

---

### Package Transfer

Kapag gusto ng client na i-transfer ang kanyang package sa ibang tao:

1. Pumunta sa **Client Profile** ng client
2. **Packages tab** → click **Transfer**
3. Hanapin ang bagong client na tatanggap ng package
4. Confirm transfer
5. Sessions remaining ay mililipat sa bagong client

---

## Inventory Module

### Para saan?
Para sa **pag-track ng stock ng lahat ng products** — skincare products, salon supplies, spa consumables.

---

### Stock Overview

- Makikita ang lahat ng products at kanilang current stock
- 🔴 **Low Stock** badge — kapag malapit na maubos (below threshold)
- 🟡 **Expiring Soon** badge — mag-e-expire sa loob ng 30 days
- 🔴 **Expired** badge — expired na ang product

---

### Mag-log ng Stock Adjustment (Admin/Owner only)

1. Pumunta sa **Inventory** → **Adjustments**
2. Click **New Adjustment**
3. Piliin ang product
4. Piliin ang type:

| Type | Kahulugan |
|---|---|
| **Stock In** | Bagong delivery / restocking |
| **Stock Out** | Ginamit sa service / sold |
| **Spoilage** | Nasira o nag-expire |
| **Damaged** | Nasiraan ng packaging o nawasak |

5. Ilagay ang quantity at reason
6. Click **Save** — automatic na mag-a-update ang stock count

> ⚠️ Hindi mo mababago ang stock number directly — lahat ng changes ay kailangan mag-go through sa Inventory Adjustment para may trail.

---

## Expenses Module

### Para saan?
Para sa **pag-record ng lahat ng gastos ng clinic**.

---

### Mag-log ng Expense

1. Pumunta sa **Expenses** sa sidebar
2. Click **New Expense**
3. Punan:
   - Category:
     - `Operations` — bayad sa utilities, rent, supplies
     - `Employee Representation` — team meals, incentives
     - `Travel Allowance` — transportation ng staff
     - `Cost of Service` — materials na ginamit sa treatment
   - Description — detalye ng gastos
   - Amount
   - Date
4. Click **Save**

---

## Commissions Module

### Para saan?
Para sa **pag-view ng commission na kinita ng bawat staff** per transaction.

---

### Paano nako-compute ang commission?

- Bawat transaction, may nakaka-assign na staff (1 hanggang marami)
- Ang commission ay based sa service commission rates sa services table
- Kapag maraming service lines, system uses weighted effective rate
- Kapag maraming staff sa iisang transaction — commission pool ay equal split per assigned staff

### Paano makita ang commission?

**Para sa Staff:**
- Pumunta sa **Commissions** sa sidebar
- Makikita mo lang ang **sarili mong commission**
- Pwedeng i-filter by date range at sariling entries lang ang visible

**Para sa Admin/Owner:**
- Makikita ang commission ng **lahat ng staff**
- Filter by staff name at date range

---

## Reports Module

*(Admin at Owner lang ang may access dito)*

---

### Sales Report

- Date range filter (default current month)
- Summary cards: Total Sales, Total Transactions, Average per Transaction
- Breakdown by payment method (transactions count + amount)
- Daily table: Date, Transactions, Gross, Discount, Net

---

### Expense Report

- Lahat ng expenses grouped by category
- Filter by date range
- Total per category at grand total

---

### Profit & Loss Report

```
Total Revenue (Sales)
- Total Expenses
= Net Profit / Loss
```

- Filter by month o custom date range

---

### Inventory Report

- Current stock snapshot ng lahat ng products
- Spoilage summary (total value ng nasayang products)
- Low stock list

---

### Commission Report

- Date range + staff filter
- Per-staff summary (transactions + total commission)
- Detail table with: date, staff, transaction, service, gross, rate, pool share, commission

---

### Export

Lahat ng reports ay may **Export button** — pwedeng i-download as CSV para i-open sa Excel.

---

## Settings

*(Admin at Owner lang)*

---

### User Management

- Tingnan ang lahat ng staff accounts
- Baguhin ang role ng isang user
- I-deactivate ang account ng umalis na staff

---

### Audit Log

- Lahat ng actions sa system ay naka-record dito
- Makikita: kung sino, anong ginawa, kailan, sa anong record
- Hindi ito pwedeng burahin — permanent trail

---

## Common Scenarios

---

### Scenario 1: Regular client nag-avail ng facial

1. New Transaction
2. Piliin ang client
3. Add Service → Facial
4. Payment → GCash
5. Save → ✅ Completed

---

### Scenario 2: Client bumili ng 10-session package

1. Open client profile
2. Go to Client Packages page
3. Piliin ang template na "10 Sessions Facial Package"
4. Click Assign to Client
5. Sa Client Profile → Packages: makikita na ang "10 sessions remaining"

---

### Scenario 3: Client nag-redeem ng session mula sa package

1. New Transaction
2. Piliin ang client
3. Add Service → Facial → system detects na may active package
4. Click **Redeem Package Session** → price becomes ₱0
5. Save → sessions remaining ng client ay mag-a-update (e.g. 10 → 9)

---

### Scenario 4: Client nagbayad ng partial

1. New Transaction → net amount = ₱2,000
2. Payment section → Cash ₱1,000 lang ang meron siya
3. Save → status = **Partial**, balance due = ₱1,000
4. Sa Client Profile → lalabas ang ⚠️ AR Alert: "Collect Remaining Balance: ₱1,000"
5. Kapag bumalik ang client at nagbayad → gumawa ng bagong transaction para sa payment collection

---

### Scenario 5: Inventory restocking

1. Inventory → Adjustments → New Adjustment
2. Product: "Vitamin C Serum"
3. Type: Stock In
4. Quantity: 12
5. Reason: "Delivery from supplier"
6. Save → stock updated automatically

---

## Tips & Reminders

- 🔒 **Huwag ibahagi ang password mo** — bawat account ay traceable sa audit log
- ⚠️ **AR Alerts** — palaging tingnan ang client profile bago mag-redeem ng session, baka may balance pa
- 📦 **Inventory** — i-log agad ang stock-in every delivery para accurate ang stock count
- 🧾 **Receipts** — pwedeng i-print o i-screenshot ang transaction detail page bilang resibo
- 🗂️ **Exports** — para sa monthly reporting sa owner, i-export ang Sales at P&L reports as CSV

---

*For technical issues or account problems, contact your system Admin.*
