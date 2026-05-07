-- Patch: Allow transaction items and transaction staff to be readable/writable by authenticated roles
-- Run in Supabase SQL Editor

begin;

alter table public.transaction_items enable row level security;

drop policy if exists "Transaction items: authenticated read" on public.transaction_items;
create policy "Transaction items: authenticated read"
  on public.transaction_items
  for select
  using (auth.uid() is not null);

drop policy if exists "Transaction items: cashier create" on public.transaction_items;
create policy "Transaction items: cashier create"
  on public.transaction_items
  for insert
  with check (public.get_my_role() in ('Owner', 'Admin', 'Cashier'));

drop policy if exists "Transaction items: admin manage" on public.transaction_items;
create policy "Transaction items: admin manage"
  on public.transaction_items
  for all
  using (public.get_my_role() in ('Owner', 'Admin'))
  with check (public.get_my_role() in ('Owner', 'Admin'));

alter table public.transaction_staff enable row level security;

drop policy if exists "Transaction staff: authenticated read" on public.transaction_staff;
create policy "Transaction staff: authenticated read"
  on public.transaction_staff
  for select
  using (auth.uid() is not null);

drop policy if exists "Transaction staff: cashier create" on public.transaction_staff;
create policy "Transaction staff: cashier create"
  on public.transaction_staff
  for insert
  with check (public.get_my_role() in ('Owner', 'Admin', 'Cashier'));

drop policy if exists "Transaction staff: admin manage" on public.transaction_staff;
create policy "Transaction staff: admin manage"
  on public.transaction_staff
  for all
  using (public.get_my_role() in ('Owner', 'Admin'))
  with check (public.get_my_role() in ('Owner', 'Admin'));

commit;

-- Optional check:
-- select * from public.transaction_items where transaction_id = '<transaction-id>' limit 5;
-- select * from public.transaction_staff where transaction_id = '<transaction-id>' limit 5;
