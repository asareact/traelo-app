-- Traelo — Row Level Security policies
-- Run AFTER 0001_initial_schema.sql.

-- Helper: is the current user an admin?
-- SECURITY DEFINER avoids infinite recursion when policies on `profiles`
-- need to check the role of the requesting user.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────
alter table profiles enable row level security;

-- A user can read their own profile; admins read all.
create policy "profiles_select_own" on profiles
  for select using (id = auth.uid() or public.is_admin());

-- A user can update their own profile BUT cannot change `rol`.
-- The rol column is protected by a separate trigger (below) — the policy
-- allows the update, the trigger blocks role escalation.
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- Block clients from changing their own role. Only service_role (which
-- bypasses RLS and triggers via session_replication_role) or admins can.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.rol is distinct from old.rol and not public.is_admin() then
    raise exception 'No autorizado: no puedes cambiar el rol';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on profiles;
create trigger protect_profile_role
  before update on profiles
  for each row execute function public.prevent_role_change();

-- ─────────────────────────────────────────────────────────────
-- pedidos
-- ─────────────────────────────────────────────────────────────
alter table pedidos enable row level security;

create policy "pedidos_select_own" on pedidos
  for select using (user_id = auth.uid() or public.is_admin());

create policy "pedidos_insert_own" on pedidos
  for insert with check (user_id = auth.uid());

-- Only admins move orders through states / set prices.
create policy "pedidos_admin_update" on pedidos
  for update using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- pedido_items — access via the parent order
-- ─────────────────────────────────────────────────────────────
alter table pedido_items enable row level security;

create policy "items_select_via_order" on pedido_items
  for select using (
    public.is_admin() or exists (
      select 1 from pedidos
      where pedidos.id = pedido_items.pedido_id
        and pedidos.user_id = auth.uid()
    )
  );

-- Client can add items to their own order (while creating the quote).
create policy "items_insert_via_order" on pedido_items
  for insert with check (
    exists (
      select 1 from pedidos
      where pedidos.id = pedido_items.pedido_id
        and pedidos.user_id = auth.uid()
    )
  );

-- Only admins fill product name / real price / mark processed.
create policy "items_admin_update" on pedido_items
  for update using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- estados_pedido — clients read their own order history; admins write
-- ─────────────────────────────────────────────────────────────
alter table estados_pedido enable row level security;

create policy "estados_select_via_order" on estados_pedido
  for select using (
    public.is_admin() or exists (
      select 1 from pedidos
      where pedidos.id = estados_pedido.pedido_id
        and pedidos.user_id = auth.uid()
    )
  );

create policy "estados_admin_insert" on estados_pedido
  for insert with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- notificaciones — users see their own
-- ─────────────────────────────────────────────────────────────
alter table notificaciones enable row level security;

create policy "notif_select_own" on notificaciones
  for select using (user_id = auth.uid() or public.is_admin());

create policy "notif_admin_all" on notificaciones
  for all using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- config — public read, admin write
-- ─────────────────────────────────────────────────────────────
alter table config enable row level security;

create policy "config_public_read" on config
  for select using (true);

create policy "config_admin_write" on config
  for all using (public.is_admin());
