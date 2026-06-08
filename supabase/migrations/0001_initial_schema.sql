-- Traelo — Initial schema
-- 6 tables: profiles, pedidos, pedido_items, estados_pedido, notificaciones, config
-- Run this in the Supabase SQL editor (or via the Supabase CLI).

-- ─────────────────────────────────────────────────────────────
-- profiles — extends auth.users
-- ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text,
  telefono text,
  direccion text,
  rol text not null default 'cliente' check (rol in ('cliente', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, new.raw_user_meta_data->>'nombre');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- pedidos — order header
-- ─────────────────────────────────────────────────────────────
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  estado_actual text not null default 'COTIZACION',
  total_real_usd numeric(10,2),
  nota_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pedidos_user on pedidos(user_id);
create index if not exists idx_pedidos_estado on pedidos(estado_actual);

-- ─────────────────────────────────────────────────────────────
-- pedido_items — products inside an order
-- ─────────────────────────────────────────────────────────────
create table if not exists pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  -- client-filled
  shein_url text not null,
  talla text,
  color text,
  cantidad int not null default 1 check (cantidad > 0),
  notas_cliente text,
  -- admin-filled
  producto_nombre text,
  producto_imagen text,
  precio_real_usd numeric(10,2),
  procesado boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_items_pedido on pedido_items(pedido_id);

-- ─────────────────────────────────────────────────────────────
-- estados_pedido — state transition history
-- ─────────────────────────────────────────────────────────────
create table if not exists estados_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  estado text not null,
  nota text,
  created_at timestamptz not null default now()
);

create index if not exists idx_estados_pedido on estados_pedido(pedido_id);

-- ─────────────────────────────────────────────────────────────
-- notificaciones
-- ─────────────────────────────────────────────────────────────
create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pedido_id uuid references pedidos(id) on delete cascade,
  tipo text not null,
  mensaje text,
  enviado boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notif_user on notificaciones(user_id);

-- ─────────────────────────────────────────────────────────────
-- config — business parameters (key/value)
-- ─────────────────────────────────────────────────────────────
create table if not exists config (
  key text primary key,
  value text not null,
  descripcion text
);

insert into config (key, value, descripcion) values
  ('whatsapp_phone', '0000000000', 'Número WhatsApp del negocio (formato internacional sin +)'),
  ('precio_por_lb', '7.00', 'Precio de envío por libra en USD (mínimo 1 lb)'),
  ('markup_factor', '1.30', 'Multiplicador de referencia para cálculos manuales'),
  ('sla_horas', '24', 'Horas estimadas para que el admin confirme el precio')
on conflict (key) do nothing;
