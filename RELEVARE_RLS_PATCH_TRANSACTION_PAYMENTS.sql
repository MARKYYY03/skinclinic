-- Patch: Allow transaction_payments to be readable/writable by proper roles
-- Run in Supabase SQL Editor

begin;

alter table public.transaction_payments enable row level security;

drop policy if exists "Transaction payments: authenticated read" on public.transaction_payments;
create policy "Transaction payments: authenticated read"
  on public.transaction_payments
  for select
  using (auth.uid() is not null);

drop policy if exists "Transaction payments: cashier create" on public.transaction_payments;
create policy "Transaction payments: cashier create"
  on public.transaction_payments
  for insert
  with check (public.get_my_role() in ('Owner', 'Admin', 'Cashier'));

drop policy if exists "Transaction payments: admin manage" on public.transaction_payments;
create policy "Transaction payments: admin manage"
  on public.transaction_payments
  for all
  using (public.get_my_role() in ('Owner', 'Admin'))
  with check (public.get_my_role() in ('Owner', 'Admin'));

commit;

-- Optional check:
-- select method, amount, created_at from public.transaction_payments order by created_at desc limit 20;
