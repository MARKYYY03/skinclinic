-- Relevare Skincare Boutique Salon & Spa
-- Development seed data (based on RELEVARE_SEED_DATA_REFERENCE.md)
-- Safe to re-run: existing seed rows are removed then recreated.

begin;

-- =========================================================
-- 0) STAFF / USERS (profiles only)
-- NOTE:
-- - Supabase SQL cannot create auth users with passwords directly here.
-- - This maps the first up to 5 existing auth.users into seeded profiles.
-- =========================================================
with seed_staff(seed_order, full_name, role, is_active) as (
  values
    (1, 'Maria Santos', 'Owner', true),
    (2, 'Angela Dela Cruz', 'Admin', true),
    (3, 'Carlo Reyes', 'Cashier', true),
    (4, 'Nina Gonzales', 'Staff', true),
    (5, 'Bea Lim', 'Staff', true)
),
existing_auth as (
  select id, row_number() over (order by created_at, id) as seed_order
  from auth.users
  order by created_at, id
  limit 5
)
insert into public.profiles (id, full_name, role, is_active)
select ea.id, ss.full_name, ss.role::public.user_role, ss.is_active
from existing_auth ea
join seed_staff ss on ss.seed_order = ea.seed_order
on conflict (id) do update
set
  full_name = excluded.full_name,
  role = excluded.role,
  is_active = excluded.is_active;

-- Common actor for created_by / recorded_by references
with actor as (
  select id
  from public.profiles
  order by
    case role
      when 'Owner' then 1
      when 'Admin' then 2
      when 'Cashier' then 3
      when 'Staff' then 4
      else 5
    end,
    id
  limit 1
)
select id from actor;

-- =========================================================
-- 1) CLIENTS
-- =========================================================
delete from public.clients where notes like '[SEED:%';

insert into public.clients (
  full_name,
  contact_number,
  email,
  address,
  birthdate,
  gender,
  category,
  medical_history,
  allergies,
  notes,
  created_by
)
values
  ('Sophia Martinez', '09180000011', 'sophia.m@example.local', 'Quezon City', '1994-04-11', 'Female', 'Regular', null, 'None', '[SEED:C-0001] Prefers weekend appointments', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Daniel Villanueva', '09180000012', 'daniel.v@example.local', 'Makati City', '1989-09-23', 'Male', 'Regular', null, 'Aspirin', '[SEED:C-0002] Sensitive skin history', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Camille Ramos', '09180000013', 'camille.r@example.local', 'Pasig City', '1997-12-02', 'Female', 'VIP', null, 'None', '[SEED:C-0003] Acne program package', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Lara Sy', '09180000014', 'lara.sy@example.local', 'Taguig City', '1991-06-18', 'Female', 'Regular', null, 'Fragrance', '[SEED:C-0004] Requests hypoallergenic products', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Miguel Tan', '09180000015', 'miguel.t@example.local', 'Mandaluyong City', '1986-11-30', 'Male', 'Regular', null, 'None', '[SEED:C-0005] Corporate client referral', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Patricia Ong', '09180000016', 'patricia.o@example.local', 'Quezon City', '1993-03-09', 'Female', 'VIP', null, 'Sulfa', '[SEED:C-0006] Confirm medicine intake each visit', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Hannah Co', '09180000017', 'hannah.c@example.local', 'Marikina City', '2000-08-27', 'Female', 'Regular', null, 'None', '[SEED:C-0007] Student discount profile', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Rafael Cruz', '09180000018', 'rafael.c@example.local', 'Pasay City', '1995-01-16', 'Male', 'Regular', null, 'None', '[SEED:C-0008] Interested in laser sessions', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1));

-- =========================================================
-- 2) SERVICES
-- =========================================================
delete from public.services where description like '[SEED:%';

insert into public.services (name, description, category, price, commission_rate, is_active)
values
  ('Signature Facial Deep Cleanse', '[SEED:SVC-001] Core cleansing facial service', 'Facial', 1800, 10, true),
  ('Acne Control Facial', '[SEED:SVC-002] Acne-focused treatment', 'Facial', 2500, 12, true),
  ('Brightening Gluta Facial', '[SEED:SVC-003] Brightening and tone-evening facial', 'Facial', 2200, 12, true),
  ('Carbon Laser Peel', '[SEED:SVC-004] Laser exfoliation and texture refinement', 'Laser', 3200, 15, true),
  ('Diode Underarm Whitening', '[SEED:SVC-005] Pigmentation reduction treatment', 'Laser', 2800, 14, true),
  ('RF Skin Tightening', '[SEED:SVC-006] Non-invasive firming treatment', 'Aesthetic', 3500, 15, true),
  ('Back Acne Treatment', '[SEED:SVC-007] Back-focused acne management', 'Body', 2600, 12, true);

-- =========================================================
-- 3) PRODUCTS
-- =========================================================
delete from public.products where sku in (
  'PRD-001','PRD-002','PRD-003','PRD-004','PRD-005','PRD-006','PRD-007','PRD-008'
);

insert into public.products (
  name,
  sku,
  supplier,
  selling_price,
  cost_price,
  stock_quantity,
  low_stock_threshold,
  expiration_date
)
values
  ('Gentle Foaming Cleanser 120ml', 'PRD-001', 'DermTrade Inc.', 480, 220, 45, 12, null),
  ('Niacinamide Serum 30ml', 'PRD-002', 'DermTrade Inc.', 650, 280, 35, 10, null),
  ('SPF50 Daily Sunblock 50ml', 'PRD-003', 'Skin Essentials PH', 720, 300, 40, 12, null),
  ('Retinol Night Cream 30g', 'PRD-004', 'Skin Essentials PH', 850, 350, 22, 8, null),
  ('Soothing Gel Mask 100ml', 'PRD-005', 'MedSupply PH', 420, 180, 30, 10, null),
  ('Post-Laser Recovery Mist 80ml', 'PRD-006', 'MedSupply PH', 590, 260, 18, 6, null),
  ('Anti-Acne Spot Corrector 15ml', 'PRD-007', 'DermTrade Inc.', 460, 190, 28, 8, null),
  ('Collagen Booster Capsules (30s)', 'PRD-008', 'Wellness Labs', 980, 420, 15, 5, null);

-- =========================================================
-- 4) PACKAGE TEMPLATES
-- =========================================================
delete from public.service_packages
where name in ('Acne Rescue Starter', 'Bright Skin Program', 'Laser Smooth Combo', 'Youth Lift Series');

insert into public.service_packages (name, service_id, session_count, price, validity_days, is_active)
select
  v.name,
  s.id,
  v.session_count,
  v.price,
  v.validity_days,
  true
from (
  values
    ('Acne Rescue Starter', 'Acne Control Facial', 3, 9200, 120),
    ('Bright Skin Program', 'Brightening Gluta Facial', 5, 12000, 180),
    ('Laser Smooth Combo', 'Carbon Laser Peel', 5, 26500, 210),
    ('Youth Lift Series', 'RF Skin Tightening', 5, 18900, 180)
) as v(name, service_name, session_count, price, validity_days)
join public.services s on s.name = v.service_name;

-- =========================================================
-- 5) SAMPLE TRANSACTIONS
-- =========================================================
-- Remove old seeded transaction tree
with seeded_tx as (
  select id from public.transactions where notes like '[SEED:TXN-%'
)
delete from public.transaction_items ti
using seeded_tx st
where ti.transaction_id = st.id;

with seeded_tx as (
  select id from public.transactions where notes like '[SEED:TXN-%'
)
delete from public.transaction_payments tp
using seeded_tx st
where tp.transaction_id = st.id;

with seeded_tx as (
  select id from public.transactions where notes like '[SEED:TXN-%'
)
delete from public.transaction_staff ts
using seeded_tx st
where ts.transaction_id = st.id;

with seeded_tx as (
  select id from public.transactions where notes like '[SEED:TXN-%'
)
delete from public.commissions c
using seeded_tx st
where c.transaction_id = st.id;

delete from public.transactions where notes like '[SEED:TXN-%';

-- Insert parent transactions
insert into public.transactions (
  client_id,
  client_name,
  total_amount,
  discount_total,
  net_amount,
  amount_paid,
  notes,
  status,
  created_by
)
values
  ((select id from public.clients where full_name = 'Sophia Martinez' limit 1), 'Sophia Martinez', 2520, 120, 2400, 2400, '[SEED:TXN-2026-0001] SVC-001 + PRD-003', 'Completed', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 when 'Cashier' then 3 else 4 end, id limit 1)),
  ((select id from public.clients where full_name = 'Camille Ramos' limit 1), 'Camille Ramos', 2500, 250, 2250, 2250, '[SEED:TXN-2026-0002] SVC-002', 'Completed', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 when 'Cashier' then 3 else 4 end, id limit 1)),
  ((select id from public.clients where full_name = 'Lara Sy' limit 1), 'Lara Sy', 12000, 1000, 11000, 6000, '[SEED:TXN-2026-0003] PKG-002 Downpayment', 'Partial', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 when 'Cashier' then 3 else 4 end, id limit 1)),
  ((select id from public.clients where full_name = 'Miguel Tan' limit 1), 'Miguel Tan', 3790, 190, 3600, 3600, '[SEED:TXN-2026-0004] SVC-004 + PRD-006', 'Completed', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 when 'Cashier' then 3 else 4 end, id limit 1)),
  ((select id from public.clients where full_name = 'Rafael Cruz' limit 1), 'Rafael Cruz', 2800, 0, 2800, 2800, '[SEED:TXN-2026-0005] SVC-005', 'Completed', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 when 'Cashier' then 3 else 4 end, id limit 1)),
  ((select id from public.clients where full_name = 'Patricia Ong' limit 1), 'Patricia Ong', 4630, 230, 4400, 4400, '[SEED:TXN-2026-0006] SVC-006 + PRD-001 + PRD-002', 'Completed', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 when 'Cashier' then 3 else 4 end, id limit 1)),
  ((select id from public.clients where full_name = 'Daniel Villanueva' limit 1), 'Daniel Villanueva', 3020, 120, 2900, 2900, '[SEED:TXN-2026-0007] SVC-007 + PRD-005', 'Completed', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 when 'Cashier' then 3 else 4 end, id limit 1)),
  ((select id from public.clients where full_name = 'Hannah Co' limit 1), 'Hannah Co', 1180, 80, 1100, 1100, '[SEED:TXN-2026-0008] PRD-007 + PRD-003', 'Completed', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 when 'Cashier' then 3 else 4 end, id limit 1));

-- Insert transaction items
insert into public.transaction_items (
  transaction_id,
  item_type,
  service_id,
  product_id,
  item_name,
  quantity,
  unit_price,
  discount,
  total,
  is_package_redemption,
  client_package_id
)
values
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0001] SVC-001 + PRD-003' limit 1), 'service', (select id from public.services where name = 'Signature Facial Deep Cleanse' limit 1), null, 'Signature Facial Deep Cleanse', 1, 1800, 120, 1680, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0001] SVC-001 + PRD-003' limit 1), 'product', null, (select id from public.products where sku = 'PRD-003' limit 1), 'SPF50 Daily Sunblock 50ml', 1, 720, 0, 720, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0002] SVC-002' limit 1), 'service', (select id from public.services where name = 'Acne Control Facial' limit 1), null, 'Acne Control Facial', 1, 2500, 250, 2250, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0003] PKG-002 Downpayment' limit 1), 'service', (select id from public.services where name = 'Brightening Gluta Facial' limit 1), null, 'Bright Skin Program (Downpayment)', 1, 12000, 1000, 11000, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0004] SVC-004 + PRD-006' limit 1), 'service', (select id from public.services where name = 'Carbon Laser Peel' limit 1), null, 'Carbon Laser Peel', 1, 3200, 190, 3010, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0004] SVC-004 + PRD-006' limit 1), 'product', null, (select id from public.products where sku = 'PRD-006' limit 1), 'Post-Laser Recovery Mist 80ml', 1, 590, 0, 590, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0005] SVC-005' limit 1), 'service', (select id from public.services where name = 'Diode Underarm Whitening' limit 1), null, 'Diode Underarm Whitening', 1, 2800, 0, 2800, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0006] SVC-006 + PRD-001 + PRD-002' limit 1), 'service', (select id from public.services where name = 'RF Skin Tightening' limit 1), null, 'RF Skin Tightening', 1, 3500, 230, 3270, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0006] SVC-006 + PRD-001 + PRD-002' limit 1), 'product', null, (select id from public.products where sku = 'PRD-001' limit 1), 'Gentle Foaming Cleanser 120ml', 1, 480, 0, 480, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0006] SVC-006 + PRD-001 + PRD-002' limit 1), 'product', null, (select id from public.products where sku = 'PRD-002' limit 1), 'Niacinamide Serum 30ml', 1, 650, 0, 650, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0007] SVC-007 + PRD-005' limit 1), 'service', (select id from public.services where name = 'Back Acne Treatment' limit 1), null, 'Back Acne Treatment', 1, 2600, 120, 2480, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0007] SVC-007 + PRD-005' limit 1), 'product', null, (select id from public.products where sku = 'PRD-005' limit 1), 'Soothing Gel Mask 100ml', 1, 420, 0, 420, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0008] PRD-007 + PRD-003' limit 1), 'product', null, (select id from public.products where sku = 'PRD-007' limit 1), 'Anti-Acne Spot Corrector 15ml', 1, 460, 80, 380, false, null),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0008] PRD-007 + PRD-003' limit 1), 'product', null, (select id from public.products where sku = 'PRD-003' limit 1), 'SPF50 Daily Sunblock 50ml', 1, 720, 0, 720, false, null);

-- Insert transaction payments
insert into public.transaction_payments (transaction_id, method, amount)
values
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0001] SVC-001 + PRD-003' limit 1), 'Cash', 2400),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0002] SVC-002' limit 1), 'GCash', 2250),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0003] PKG-002 Downpayment' limit 1), 'Card', 6000),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0004] SVC-004 + PRD-006' limit 1), 'Card', 3600),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0005] SVC-005' limit 1), 'GCash', 2800),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0006] SVC-006 + PRD-001 + PRD-002' limit 1), 'BankTransfer', 4400),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0007] SVC-007 + PRD-005' limit 1), 'Cash', 2900),
  ((select id from public.transactions where notes = '[SEED:TXN-2026-0008] PRD-007 + PRD-003' limit 1), 'GCash', 1100);

-- Link each transaction to one seeded staff user
insert into public.transaction_staff (transaction_id, staff_id)
select
  tx.id,
  staff.id
from public.transactions tx
cross join lateral (
  select id
  from public.profiles
  where role in ('Staff', 'Admin', 'Cashier', 'Owner')
  order by
    case role
      when 'Staff' then 1
      when 'Admin' then 2
      when 'Cashier' then 3
      else 4
    end,
    id
  limit 1
) staff
where tx.notes like '[SEED:TXN-%';

-- Add simple commission rows for seeded completed/partial transactions
insert into public.commissions (
  transaction_id,
  staff_id,
  gross_amount,
  rate,
  pool_share,
  commission_amount
)
select
  tx.id,
  staff.id,
  tx.net_amount,
  10::numeric as rate,
  1::numeric as pool_share,
  round((tx.net_amount * 0.10)::numeric, 2) as commission_amount
from public.transactions tx
cross join lateral (
  select id
  from public.profiles
  where role in ('Staff', 'Admin', 'Cashier', 'Owner')
  order by
    case role
      when 'Staff' then 1
      when 'Admin' then 2
      when 'Cashier' then 3
      else 4
    end,
    id
  limit 1
) staff
where tx.notes like '[SEED:TXN-%'
  and tx.status in ('Completed', 'Partial');

-- =========================================================
-- 6) EXPENSES
-- =========================================================
delete from public.expenses where description like '[SEED:EXP-%';

insert into public.expenses (category, description, amount, expense_date, recorded_by)
values
  ('Operations', '[SEED:EXP-2026-0001] Electricity Bill - April | Vendor: Meralco | Notes: Main branch', 12850, '2026-04-28', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('CostOfService', '[SEED:EXP-2026-0002] Facial sheets, gloves, cotton pads | Vendor: MedSupply PH | Notes: Weekly restock', 6850, '2026-04-29', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('EmployeeRepresentation', '[SEED:EXP-2026-0003] Staff salary payout (half month) | Vendor: Internal | Notes: Includes incentives', 74200, '2026-05-01', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Operations', '[SEED:EXP-2026-0004] Facebook/Instagram ads | Vendor: Meta Ads | Notes: Lead generation campaign', 9500, '2026-05-02', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Operations', '[SEED:EXP-2026-0005] Monthly clinic rent | Vendor: Greenfield Properties | Notes: May rent', 45000, '2026-05-03', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('CostOfService', '[SEED:EXP-2026-0006] Laser machine preventive maintenance | Vendor: SkinTech Services | Notes: Quarterly schedule', 7800, '2026-05-04', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('CostOfService', '[SEED:EXP-2026-0007] Product replenishment batch A | Vendor: DermTrade Inc. | Notes: SPF and serums', 23600, '2026-05-05', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1)),
  ('Operations', '[SEED:EXP-2026-0008] Pantry and cleaning materials | Vendor: S&R Membership | Notes: Consumables', 3250, '2026-05-06', (select id from public.profiles order by case role when 'Owner' then 1 when 'Admin' then 2 else 3 end, id limit 1));

commit;

-- Quick verification queries (optional):
-- select count(*) as clients_seeded from public.clients where notes like '[SEED:%';
-- select count(*) as services_seeded from public.services where description like '[SEED:%';
-- select count(*) as products_seeded from public.products where sku like 'PRD-%';
-- select count(*) as packages_seeded from public.service_packages where name in ('Acne Rescue Starter','Bright Skin Program','Laser Smooth Combo','Youth Lift Series');
-- select count(*) as tx_seeded from public.transactions where notes like '[SEED:TXN-%';
-- select count(*) as expenses_seeded from public.expenses where description like '[SEED:EXP-%';
