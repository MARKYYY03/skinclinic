# Relevare — Inventory Module
> **Phase:** Post-MVP Enhancement
> **Stack:** Next.js App Router · TypeScript · Tailwind CSS · Supabase
> **Tables involved:** `products` · `inventory_logs`

---

## What this module covers (based on requirements)

- ✅ Track stock levels per product
- ✅ Stock-in (restocking / new delivery)
- ✅ Stock-out (used in service / sold)
- ✅ Damaged items
- ✅ Expired items / Spoilage declaration
- ✅ Low-stock alerts
- ✅ Expiration date tracking
- ✅ Inventory report

---

## Pages to build

```
/inventory                  → Stock overview (main page)
/inventory/adjustments      → Log stock movement
/inventory/[id]             → Product detail + full log history
/reports/inventory          → Inventory report (summary + spoilage)
```

---

---

## Copilot Prompt 1 — Products List Page (Stock Overview)

```
Build the inventory stock overview page at 
app/(main)/inventory/page.tsx.

Data: fetch all products from `products` table where is_active = true.
Order by name ASC.

PAGE REQUIREMENTS:

Header:
- Page title: "Inventory"
- Subtitle: "Stock levels and product management"
- Two action buttons (top right):
    "Add Product" → opens Add Product modal
    "Log Adjustment" → links to /inventory/adjustments

Search & Filters (below header):
- Search bar — filter by product name or SKU
- Filter by stock status:
    All | Low Stock | Expiring Soon | Expired
- Filter by supplier (dropdown of distinct supplier values)

Table columns:
- Product Name
- SKU
- Supplier
- Cost Price (₱)
- Selling Price (₱)
- Stock Quantity (number)
- Low Stock Threshold
- Status badges (can stack multiple):
    🔴 "Low Stock"     — if stock_quantity <= low_stock_threshold
    🟡 "Expiring Soon" — if expiration_date is within 30 days from today
    🔴 "Expired"       — if expiration_date < today
    ✅ "OK"            — if none of the above
- Expiration Date (formatted)
- Actions: View → /inventory/[id]

Stock quantity cell:
- If stock_quantity <= low_stock_threshold → show number in red bold
- If stock_quantity = 0 → show "Out of Stock" in red
- Otherwise → show number normally

Summary bar (above table):
- Total Products: COUNT of all active products
- Low Stock: COUNT where stock_quantity <= low_stock_threshold
- Expiring Soon: COUNT where expiration_date within 30 days
- Expired: COUNT where expiration_date < today

Use src/components/inventory/StockTable.tsx for the table.
Use src/components/inventory/LowStockBadge.tsx for status badges.
Use src/components/inventory/ExpiryBadge.tsx for expiry badges.
```

---

## Copilot Prompt 2 — Add / Edit Product Modal

```
Build the Add Product modal inside the inventory page.
Also reuse it for editing (prefill fields when editing).

Trigger: "Add Product" button on /inventory page opens this modal.
Edit: "Edit" action on product row opens same modal with prefilled data.

FORM FIELDS (matching `products` table):
- Product Name (text, required)
- SKU (text, optional — auto-generate if left blank: "SKU-PXXX")
- Description (textarea, optional)
- Selling Price ₱ (number, required)
- Cost Price ₱ (number, required)
- Stock Quantity (number, default 0)
- Low Stock Threshold (number, default 5)
- Expiration Date (date picker, optional)
- Supplier (text, optional)
- Commission Rate % (number, default 0)
- Is Active (toggle, default true)

ON SAVE (new product):
- Insert into `products` table
- Insert a `inventory_logs` row automatically:
    adjustment_type = 'StockIn'
    quantity = initial stock_quantity entered
    reason = 'Initial stock on product creation'
    stock_before = 0
    stock_after = stock_quantity entered
    recorded_by = current user id
- Show success toast: "Product added successfully"
- Refresh the product list

ON SAVE (edit):
- Update existing row in `products`
- Do NOT create inventory log on edit (only on new)

ON ERROR:
- Show inline field validation errors
- Show error toast for database errors

Use src/components/inventory/ProductForm.tsx
```

---

## Copilot Prompt 3 — Log Adjustment Page

```
Build the inventory adjustment page at
app/(main)/inventory/adjustments/page.tsx.

This page is where staff log all stock movements:
restocking, used in service, spoilage, and damaged items.

LAYOUT:
- Page title: "Log Adjustment"
- Subtitle: "Record stock movement for a product"
- Back button → /inventory

FORM (src/components/inventory/AdjustmentForm.tsx):

Step 1 — Select Product:
- Searchable dropdown from `products` table (show name + SKU + current stock)
- After selecting, show current stock quantity prominently:
  "Current Stock: 12 units"

Step 2 — Adjustment Type:
- Select with 4 options shown as cards (not just dropdown):

  [📦 Stock In]      — Restocking / new delivery
  [📤 Stock Out]     — Used in treatment / sold manually
  [🗑️ Spoilage]      — Expired item declared as spoilage
  [⚠️ Damaged]       — Damaged packaging / unusable

Step 3 — Quantity:
- Number input (positive number only)
- For Stock In → adds to current stock
- For Stock Out / Spoilage / Damaged → subtracts from current stock
- Show live preview: 
  "After this adjustment: [computed stock_after] units"
- Validate: stock_after cannot go below 0

Step 4 — Reason / Notes:
- Textarea (required for Spoilage and Damaged, optional for others)
- Placeholder examples per type:
    Stock In → "Delivery from supplier dated May 10"
    Stock Out → "Used in 3 facial sessions today"
    Spoilage → "Found expired on shelf, declared spoilage"
    Damaged → "Broken pump, product leaked"

ON SUBMIT:
1. Compute stock_before = current products.stock_quantity
2. Compute stock_after = stock_before + qty (StockIn) 
                       OR stock_before - qty (StockOut/Spoilage/Damaged)
3. Insert into `inventory_logs`:
   - product_id, adjustment_type, quantity, reason
   - stock_before, stock_after
   - recorded_by = current user id
   - created_at = now()
4. Update `products`.stock_quantity = stock_after
   (Note: the DB trigger does this automatically — 
   do NOT update products manually if trigger is already active)
5. On success → show toast "Adjustment logged" + redirect to /inventory
6. On error → show error toast, stay on page

VALIDATION:
- Cannot submit if stock_after < 0
- Show error: "Insufficient stock. Current: X units, cannot remove Y units."
- Quantity must be > 0
```

---

## Copilot Prompt 4 — Product Detail & Log History

```
Build the product detail page at
app/(main)/inventory/[id]/page.tsx.

Data: 
- fetch product by id from `products` table
- fetch all inventory_logs for this product, 
  ORDER BY created_at DESC
  JOIN with profiles to get recorded_by full_name

PAGE LAYOUT:

Top section — Product Info Card:
- Product Name (large)
- SKU badge
- Supplier, Expiration Date
- Cost Price / Selling Price side by side
- Current Stock — large number, color coded:
    Red if <= low_stock_threshold
    Green if healthy stock
- Low Stock Threshold
- Status badges (Low Stock / Expiring Soon / Expired / OK)
- Edit button (Admin/Owner only) → opens edit modal
- Deactivate button (Admin/Owner only) → sets is_active = false

"Log Adjustment" button → /inventory/adjustments 
  (pre-select this product via query param ?productId=xxx)

Bottom section — Adjustment History Table:
- Title: "Stock Movement History"
- Columns:
    Date & Time
    Type (badge: StockIn=green, StockOut=blue, 
          Spoilage=red, Damaged=orange)
    Quantity (show +12 in green for StockIn, 
              -3 in red for StockOut/Spoilage/Damaged)
    Stock Before → Stock After (e.g. "10 → 22")
    Reason / Notes
    Recorded By (staff name)
- Empty state: "No adjustment logs yet"
- Back button → /inventory

Use src/components/inventory/AdjustmentHistoryTable.tsx
```

---

## Copilot Prompt 5 — Inventory Report Page

```
Build the inventory report page at
app/(main)/reports/inventory/page.tsx.

Admin/Owner access only.

Data sources:
- products table (current state)
- inventory_logs table (movement history)

SECTION 1 — Summary Cards (top row, 4 cards):
- Total Active Products — COUNT from products
- Total Stock Value (cost) — SUM(stock_quantity × cost_price)
- Total Stock Value (selling) — SUM(stock_quantity × selling_price)
- Total Spoilage This Month — 
  SUM(quantity) from inventory_logs 
  WHERE adjustment_type = 'Spoilage' 
  AND created_at >= start of current month

SECTION 2 — Current Stock Table:
Title: "Current Stock Snapshot"
Columns: Product Name, SKU, Stock Qty, 
         Cost Price, Selling Price, Stock Value (qty × cost),
         Status (Low/Expiring/Expired/OK)
Sorted by: Status (critical first), then name

SECTION 3 — Low Stock Alert List:
Title: "Needs Restocking"
Show only products where stock_quantity <= low_stock_threshold
Columns: Product, Current Stock, Threshold, Shortage (threshold - current)
If empty → show ✅ "All products are sufficiently stocked"

SECTION 4 — Spoilage Report:
Title: "Spoilage & Damaged Log"
Date range filter (default: current month)
Columns: Date, Product, Type (Spoilage/Damaged), 
         Qty, Reason, Recorded By, Cost Value Lost (qty × cost_price)
Total Cost Value Lost at bottom (red)

SECTION 5 — Stock Movement Summary:
Title: "Movement Summary"
Date range filter
Table grouped by product:
Columns: Product, Total Stock In, Total Stock Out, 
         Total Spoilage, Net Change, Current Stock

Export to CSV button for each section.

Use src/components/reports/InventoryReportTable.tsx
```

---

## Copilot Prompt 6 — Dashboard Low Stock Alert Widget

```
Add a Low Stock Alert section to the existing dashboard at
app/(main)/dashboard/page.tsx.

Add below the existing KPI cards.

Data: fetch from `products` where 
  stock_quantity <= low_stock_threshold AND is_active = true
  ORDER BY stock_quantity ASC
  LIMIT 5

COMPONENT: src/components/inventory/LowStockAlert.tsx

DISPLAY:
- Card title: "⚠️ Low Stock Alerts"
- If no low stock products → hide the card entirely (don't show empty card)
- If has data → show as a compact list:
    Per row: Product name · Current stock · Threshold · 
    "Log Restock" button → /inventory/adjustments?productId=xxx
- "View All" link → /inventory?filter=low-stock
- Card border: orange/amber left border accent to indicate warning

Also update the existing "Low Stock" KPI card value to 
  COUNT of products where stock_quantity <= low_stock_threshold
```

---

## Summary — Files to Create

```
app/(main)/inventory/
  page.tsx                          ← Prompt 1 (stock overview)
  adjustments/
    page.tsx                        ← Prompt 3 (log adjustment)
  [id]/
    page.tsx                        ← Prompt 4 (product detail)

app/(main)/reports/inventory/
  page.tsx                          ← Prompt 5 (inventory report)

src/components/inventory/
  StockTable.tsx                    ← Prompt 1
  LowStockBadge.tsx                 ← Prompt 1
  ExpiryBadge.tsx                   ← Prompt 1
  ProductForm.tsx                   ← Prompt 2 (add/edit modal)
  AdjustmentForm.tsx                ← Prompt 3
  AdjustmentHistoryTable.tsx        ← Prompt 4
  LowStockAlert.tsx                 ← Prompt 6 (dashboard widget)

src/components/reports/
  InventoryReportTable.tsx          ← Prompt 5

src/lib/api/
  inventory.ts                      ← fetch helpers for all above
```

---

## Run Order

```
Prompt 1 → Products list page (need to see products first)
Prompt 2 → Add/Edit product modal (need to add test data)
Prompt 3 → Log adjustment page (core feature)
Prompt 4 → Product detail + history
Prompt 5 → Inventory report
Prompt 6 → Dashboard low stock widget (last, after all pages work)
```

---

## Important Notes for Copilot

- The DB has a **trigger** `trg_inventory_apply` that auto-updates 
  `products.stock_quantity` when a row is inserted into `inventory_logs`.
  Do NOT manually update `products.stock_quantity` in your code —
  just insert into `inventory_logs` and the trigger handles the rest.

- All data fetching in `page.tsx` files uses 
  `src/lib/supabase/server.ts` (Server Component).

- All interactive parts (modals, forms, dropdowns) use 
  `'use client'` with `src/lib/supabase/client.ts`.

- Format all peso values using `formatCurrency()` from `src/lib/utils.ts`.

- Format all dates using `formatDate()` from `src/lib/utils.ts`.

- Use the Relevare brand colors: olive green `#4a5e28`, cream `#f7f3ec`.
