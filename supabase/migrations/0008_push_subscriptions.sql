-- Traelo — Web Push subscriptions (Fase 3). One row per device/browser endpoint.
-- The client manages its own rows (RLS); the server SEND path uses the
-- service-role admin client (bypasses RLS) to read every subscriber's rows.
-- Run AFTER 0007_recargo_express_usd.sql.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx
  on push_subscriptions(user_id);

alter table push_subscriptions enable row level security;

drop policy if exists "own push subs - select" on push_subscriptions;
create policy "own push subs - select" on push_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "own push subs - insert" on push_subscriptions;
create policy "own push subs - insert" on push_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "own push subs - update" on push_subscriptions;
create policy "own push subs - update" on push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own push subs - delete" on push_subscriptions;
create policy "own push subs - delete" on push_subscriptions
  for delete using (auth.uid() = user_id);
