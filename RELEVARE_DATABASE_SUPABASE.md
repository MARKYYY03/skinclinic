# Relevare — Supabase Database Schema
> **Database:** Supabase (PostgreSQL)  
> **Auth:** Supabase Auth (`auth.users` as the base user table)  
> **Phase:** Database Setup — run these SQL scripts in the Supabase SQL Editor in order

---

## ⚠️ Rules Before You Start

- Run scripts in the **exact order** listed below
- All tables use `uuid` as primary key (Supabase default)
- `created_at` and `updated_at` are on every table
- **Row Level Security (RLS)** is enabled on all tables — policies are defined per table
- Use **Supabase SQL Editor** or the migration files in `/supabase/migrations/`

---

## Setup Order

```
1. Extensions & Helpers
2. Enums
3. Core Tables (no foreign keys)
4. Relational Tables (foreign keys)
5. Derived / Log Tables
6. Functions & Triggers
7. RLS Policies
8. Indexes
```

---

## 1. Extensions & Helpers

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Auto-update updated_at helper function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

---

## 2. Enums

```sql
create type user_role as enum ('Owner', 'Admin', 'Cashier', 'Staff');

create type client_category as enum ('Regular', 'VIP');

create type gender_type as enum ('Male', 'Female', 'Other');

create type payment_method as enum (
  'Cash', 'GCash', 'Maya', 'Card', 'BankTransfer', 'HomeCredit'
);

create type transaction_status as enum ('Completed', 'Partial', 'Voided');

create type transaction_item_type as enum ('service', 'product');

create type inventory_adjustment_type as enum (
  'StockIn', 'StockOut', 'Spoilage', 'Damaged'
);

create type expense_category as enum (
  'Operations', 'EmployeeRepresentation', 'TravelAllowance', 'CostOfService'
);

create type audit_action as enum (
  'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
);
```

---

## 3. Core Tables

### 3.1 `profiles` — extends Supabase `auth.users`

```sql
-- One profile per auth user
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        user_role not null default 'Staff',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
```

> **Note:** When a new user signs up via Supabase Auth, create a matching `profiles` row. Use a Supabase Auth trigger or handle it in your Next.js API.

---

### 3.2 `clients`

```sql
create table clients (
  id              uuid primary key default uuid_generate_v4(),
  full_name       text not null,
  contact_number  text,
  email           text,
  address         text,
  birthdate       date,
  gender          gender_type,
  category        client_category not null default 'Regular',
  medical_history text,
  allergies       text,
  notes           text,
  is_active       boolean not null default true,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_clients_updated_at
  before update on clients
  for each row execute function update_updated_at();
```

---

### 3.3 `services`

```sql
create table services (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  description  text,
  price        numeric(10, 2) not null default 0,
  category     text,                        -- e.g. 'Skincare', 'Salon', 'Spa', 'Massage'
  commission_rate numeric(5, 2) default 0,  -- percentage e.g. 5.00 = 5%
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_services_updated_at
  before update on services
  for each row execute function update_updated_at();
```

---

### 3.4 `products`

```sql
create table products (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  sku                  text unique,
  description          text,
  selling_price        numeric(10, 2) not null default 0,
  cost_price           numeric(10, 2) not null default 0,
  stock_quantity       integer not null default 0,
  low_stock_threshold  integer not null default 5,
  expiration_date      date,
  supplier             text,
  commission_rate      numeric(5, 2) default 0,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger trg_products_updated_at
  before update on products
  for each row execute function update_updated_at();
```

---

### 3.5 `service_packages` — Package Templates

```sql
-- Template that defines a package (e.g. "10 sessions Facial for ₱5,000")
create table service_packages (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  service_id     uuid not null references services(id) on delete restrict,
  session_count  integer not null check (session_count in (3, 5, 10, 15)),
  price          numeric(10, 2) not null,
  validity_days  integer not null default 365,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger trg_service_packages_updated_at
  before update on service_packages
  for each row execute function update_updated_at();
```

---

### 3.6 `expense_categories`

```sql
-- Optional: manage categories as a table (or use the enum directly)
create table expense_categories (
  id    uuid primary key default uuid_generate_v4(),
  name  expense_category not null unique
);

-- Seed default categories
insert into expense_categories (name) values
  ('Operations'),
  ('EmployeeRepresentation'),
  ('TravelAllowance'),
  ('CostOfService');
```

---

## 4. Relational Tables

### 4.1 `transactions`

```sql
create table transactions (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid references clients(id) on delete set null,
  client_name     text not null,              -- denormalized for walk-ins / record safety
  total_amount    numeric(10, 2) not null default 0,
  discount_total  numeric(10, 2) not null default 0,
  net_amount      numeric(10, 2) not null default 0,
  amount_paid     numeric(10, 2) not null default 0,
  balance_due     numeric(10, 2) generated always as (net_amount - amount_paid) stored,
  status          transaction_status not null default 'Completed',
  notes           text,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_transactions_updated_at
  before update on transactions
  for each row execute function update_updated_at();
```

---

### 4.2 `transaction_items`

```sql
-- Each line item in a transaction (service or product)
create table transaction_items (
  id             uuid primary key default uuid_generate_v4(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  item_type      transaction_item_type not null,
  service_id     uuid references services(id) on delete set null,
  product_id     uuid references products(id) on delete set null,
  item_name      text not null,               -- denormalized snapshot of name at time of sale
  quantity       integer not null default 1,
  unit_price     numeric(10, 2) not null,
  discount       numeric(10, 2) not null default 0,
  total          numeric(10, 2) not null,
  -- If this line was a package session redemption
  client_package_id uuid,                     -- FK added after client_packages table below
  is_package_redemption boolean not null default false,
  created_at     timestamptz not null default now(),

  -- Ensure only one of service_id or product_id is set
  constraint chk_item_type check (
    (item_type = 'service' and service_id is not null and product_id is null) or
    (item_type = 'product' and product_id is not null and service_id is null)
  )
);
```

---

### 4.3 `transaction_payments`

```sql
-- Split payments per transaction (one transaction can have multiple)
create table transaction_payments (
  id             uuid primary key default uuid_generate_v4(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  method         payment_method not null,
  amount         numeric(10, 2) not null,
  created_at     timestamptz not null default now()
);
```

---

### 4.4 `transaction_staff`

```sql
-- Staff assigned per transaction (commission pool)
create table transaction_staff (
  id             uuid primary key default uuid_generate_v4(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  staff_id       uuid not null references profiles(id) on delete cascade,
  created_at     timestamptz not null default now(),

  unique (transaction_id, staff_id)
);
```

---

### 4.5 `client_packages`

```sql
-- A client's purchased package instance
create table client_packages (
  id                     uuid primary key default uuid_generate_v4(),
  client_id              uuid not null references clients(id) on delete cascade,
  package_id             uuid not null references service_packages(id) on delete restrict,
  package_name           text not null,       -- snapshot
  service_name           text not null,       -- snapshot
  total_sessions         integer not null,
  sessions_used          integer not null default 0,
  sessions_remaining     integer generated always as (total_sessions - sessions_used) stored,
  price_paid             numeric(10, 2) not null,
  purchased_at           timestamptz not null default now(),
  expires_at             timestamptz not null,
  is_transferable        boolean not null default true,
  transferred_to_client  uuid references clients(id) on delete set null,
  transaction_id         uuid references transactions(id) on delete set null, -- the purchase transaction
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger trg_client_packages_updated_at
  before update on client_packages
  for each row execute function update_updated_at();

-- Now add the FK from transaction_items to client_packages
alter table transaction_items
  add constraint fk_transaction_items_client_package
  foreign key (client_package_id)
  references client_packages(id) on delete set null;
```

---

### 4.6 `commissions`

```sql
-- Commission computed per staff per transaction
create table commissions (
  id             uuid primary key default uuid_generate_v4(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  staff_id       uuid not null references profiles(id) on delete cascade,
  gross_amount   numeric(10, 2) not null,  -- total transaction net amount
  rate           numeric(5, 2) not null,   -- commission rate applied (%)
  pool_share     numeric(5, 2) not null,   -- each staff's share e.g. 0.5 if 2 staff
  commission_amount numeric(10, 2) not null,
  created_at     timestamptz not null default now(),

  unique (transaction_id, staff_id)
);
```

---

### 4.7 `expenses`

```sql
create table expenses (
  id           uuid primary key default uuid_generate_v4(),
  category     expense_category not null,
  description  text not null,
  amount       numeric(10, 2) not null,
  expense_date date not null default current_date,
  recorded_by  uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_expenses_updated_at
  before update on expenses
  for each row execute function update_updated_at();
```

---

## 5. Log / Audit Tables

### 5.1 `inventory_logs`

```sql
create table inventory_logs (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references products(id) on delete cascade,
  adjustment_type inventory_adjustment_type not null,
  quantity        integer not null,           -- positive for in, negative for out
  reason          text,
  stock_before    integer not null,
  stock_after     integer not null,
  recorded_by     uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);
```

---

### 5.2 `audit_logs`

```sql
create table audit_logs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references profiles(id) on delete set null,
  action       audit_action not null,
  table_name   text,
  record_id    uuid,
  old_data     jsonb,
  new_data     jsonb,
  ip_address   inet,
  created_at   timestamptz not null default now()
);
```

---

## 6. Functions & Triggers

### 6.1 Auto-create profile on Supabase Auth signup

```sql
-- Run this in Supabase SQL Editor
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'Staff'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

---

### 6.2 Auto-update product stock after inventory log

```sql
create or replace function apply_inventory_adjustment()
returns trigger as $$
begin
  update products
  set stock_quantity = new.stock_after
  where id = new.product_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_inventory_apply
  after insert on inventory_logs
  for each row execute function apply_inventory_adjustment();
```

---

### 6.3 Auto-update sessions_used when a package session is redeemed

```sql
create or replace function increment_package_sessions()
returns trigger as $$
begin
  if new.is_package_redemption = true and new.client_package_id is not null then
    update client_packages
    set sessions_used = sessions_used + new.quantity
    where id = new.client_package_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_package_session_redemption
  after insert on transaction_items
  for each row execute function increment_package_sessions();
```

---

## 7. Row Level Security (RLS)

```sql
-- Enable RLS on all tables
alter table profiles           enable row level security;
alter table clients            enable row level security;
alter table services           enable row level security;
alter table products           enable row level security;
alter table service_packages   enable row level security;
alter table transactions       enable row level security;
alter table transaction_items  enable row level security;
alter table transaction_payments enable row level security;
alter table transaction_staff  enable row level security;
alter table client_packages    enable row level security;
alter table commissions        enable row level security;
alter table expenses           enable row level security;
alter table inventory_logs     enable row level security;
alter table audit_logs         enable row level security;

-- Helper: get current user's role
create or replace function get_my_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- ─── PROFILES ─────────────────────────────────────────────────
-- Users can read all profiles, only update their own
create policy "Profiles: read all"
  on profiles for select using (true);

create policy "Profiles: update own"
  on profiles for update using (auth.uid() = id);

create policy "Profiles: admin manage"
  on profiles for all
  using (get_my_role() in ('Owner', 'Admin'));

-- ─── CLIENTS ──────────────────────────────────────────────────
-- All authenticated users can read clients
create policy "Clients: authenticated read"
  on clients for select using (auth.uid() is not null);

-- Cashier and above can create
create policy "Clients: create"
  on clients for insert
  with check (get_my_role() in ('Owner', 'Admin', 'Cashier'));

-- Admin and Owner can update/delete
create policy "Clients: admin manage"
  on clients for all
  using (get_my_role() in ('Owner', 'Admin'));

-- ─── TRANSACTIONS ─────────────────────────────────────────────
create policy "Transactions: authenticated read"
  on transactions for select using (auth.uid() is not null);

create policy "Transactions: cashier create"
  on transactions for insert
  with check (get_my_role() in ('Owner', 'Admin', 'Cashier'));

create policy "Transactions: admin manage"
  on transactions for update using (get_my_role() in ('Owner', 'Admin'));

-- NOTE: `transaction_items` and `transaction_staff` also require row-level security policies
-- for authenticated reads and cashier/admin inserts. See `RELEVARE_RLS_PATCH_TRANSACTION_ITEMS_AND_STAFF.sql`.

-- ─── COMMISSIONS ──────────────────────────────────────────────
-- Staff can only see their own commissions; Admin/Owner see all
create policy "Commissions: own"
  on commissions for select
  using (staff_id = auth.uid() or get_my_role() in ('Owner', 'Admin'));

-- ─── AUDIT LOGS ───────────────────────────────────────────────
create policy "Audit: admin read only"
  on audit_logs for select
  using (get_my_role() in ('Owner', 'Admin'));

-- ─── EVERYTHING ELSE: authenticated users can read ────────────
create policy "Services: read"
  on services for select using (auth.uid() is not null);
create policy "Services: admin manage"
  on services for all using (get_my_role() in ('Owner', 'Admin'));

create policy "Products: read"
  on products for select using (auth.uid() is not null);
create policy "Products: admin manage"
  on products for all using (get_my_role() in ('Owner', 'Admin'));

create policy "Expenses: read"
  on expenses for select using (get_my_role() in ('Owner', 'Admin'));
create policy "Expenses: create"
  on expenses for insert with check (get_my_role() in ('Owner', 'Admin', 'Cashier'));

create policy "Inventory logs: read"
  on inventory_logs for select using (auth.uid() is not null);
create policy "Inventory logs: admin manage"
  on inventory_logs for insert with check (get_my_role() in ('Owner', 'Admin'));
```

---

## 8. Indexes

```sql
-- Fast client search
create index idx_clients_full_name on clients using gin (to_tsvector('english', full_name));
create index idx_clients_contact   on clients (contact_number);

-- Transaction lookups
create index idx_transactions_client_id  on transactions (client_id);
create index idx_transactions_created_at on transactions (created_at desc);
create index idx_transactions_status     on transactions (status);

-- Transaction items
create index idx_tx_items_transaction_id on transaction_items (transaction_id);

-- Commission by staff
create index idx_commissions_staff_id    on commissions (staff_id);
create index idx_commissions_tx_id       on commissions (transaction_id);

-- Client packages
create index idx_client_packages_client  on client_packages (client_id);
create index idx_client_packages_expiry  on client_packages (expires_at);

-- Inventory by product
create index idx_inventory_logs_product  on inventory_logs (product_id);
create index idx_inventory_logs_date     on inventory_logs (created_at desc);

-- Expenses by date
create index idx_expenses_date           on expenses (expense_date desc);
create index idx_expenses_category       on expenses (category);

-- Audit log
create index idx_audit_logs_user_id      on audit_logs (user_id);
create index idx_audit_logs_table        on audit_logs (table_name);
create index idx_audit_logs_created_at   on audit_logs (created_at desc);
```

---

## 9. Entity Relationship Summary

```
auth.users
  └── profiles (1:1)
        ├── transactions.created_by
        ├── transaction_staff.staff_id
        ├── commissions.staff_id
        └── expenses.recorded_by

clients
  ├── transactions (1:many)
  └── client_packages (1:many)
        └── service_packages (many:1)
              └── services (many:1)

transactions
  ├── transaction_items (1:many)
  │     ├── services (many:1)
  │     ├── products (many:1)
  │     └── client_packages (many:1) — if package redemption
  ├── transaction_payments (1:many)
  ├── transaction_staff (1:many)
  └── commissions (1:many)

products
  └── inventory_logs (1:many)
```

---

## 10. Supabase Folder Convention (for migrations)

```
supabase/
└── migrations/
    ├── 001_extensions.sql
    ├── 002_enums.sql
    ├── 003_core_tables.sql
    ├── 004_relational_tables.sql
    ├── 005_log_tables.sql
    ├── 006_functions_triggers.sql
    ├── 007_rls_policies.sql
    └── 008_indexes.sql
```

> Run via Supabase CLI: `supabase db push` or paste each file into the **SQL Editor** in order.

---

## 11. Environment Variables for Next.js

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-side only, never expose to client
```

Install the Supabase client:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## 12. Copilot Instruction for This Phase

```
Set up Supabase client helpers for the Relevare Next.js project.

1. Create /src/lib/supabase/client.ts — browser-side Supabase client using 
   createBrowserClient from @supabase/ssr.

2. Create /src/lib/supabase/server.ts — server-side Supabase client using 
   createServerClient from @supabase/ssr with Next.js cookies.

3. Create /src/lib/supabase/middleware.ts — session refresh middleware 
   using updateSession from @supabase/ssr. Wire this into /src/middleware.ts 
   to protect all (main) routes and redirect unauthenticated users to /login.

4. Generate TypeScript types from the schema above and place them in 
   /src/types/database.types.ts. Use the table definitions from the schema 
   doc as the source of truth.

Use the official @supabase/ssr pattern — do NOT use the deprecated 
@supabase/auth-helpers-nextjs package.
```
