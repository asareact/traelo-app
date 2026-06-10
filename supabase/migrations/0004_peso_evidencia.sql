-- Traelo — Package weight + weigh-in evidence
-- The admin weighs the consolidated package once it reaches the US casillero
-- and (optionally) attaches a photo as evidence. Weight is per ORDER, not item.
-- Run AFTER 0003.

alter table pedidos
  add column if not exists peso_lb numeric(10,2),
  add column if not exists peso_evidencia_url text;

-- ─────────────────────────────────────────────────────────────
-- Storage bucket for evidence photos (package on the scale).
-- Public read: the tracking page is already public-by-UUID and these photos
-- are not sensitive. Only admins can upload/replace.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', true)
on conflict (id) do nothing;

drop policy if exists "evidencias_public_read" on storage.objects;
create policy "evidencias_public_read" on storage.objects
  for select using (bucket_id = 'evidencias');

drop policy if exists "evidencias_admin_insert" on storage.objects;
create policy "evidencias_admin_insert" on storage.objects
  for insert with check (bucket_id = 'evidencias' and public.is_admin());

drop policy if exists "evidencias_admin_update" on storage.objects;
create policy "evidencias_admin_update" on storage.objects
  for update using (bucket_id = 'evidencias' and public.is_admin());

drop policy if exists "evidencias_admin_delete" on storage.objects;
create policy "evidencias_admin_delete" on storage.objects
  for delete using (bucket_id = 'evidencias' and public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Storage bucket for PRODUCT images (a self-hosted copy of the SHEIN photo, so
-- the order keeps a valid image even if the SHEIN CDN link rots). Same policy
-- shape as evidencias. The copy-on-process + cleanup-on-close logic ships in a
-- follow-up; this just provisions the bucket.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

drop policy if exists "productos_public_read" on storage.objects;
create policy "productos_public_read" on storage.objects
  for select using (bucket_id = 'productos');

drop policy if exists "productos_admin_insert" on storage.objects;
create policy "productos_admin_insert" on storage.objects
  for insert with check (bucket_id = 'productos' and public.is_admin());

drop policy if exists "productos_admin_update" on storage.objects;
create policy "productos_admin_update" on storage.objects
  for update using (bucket_id = 'productos' and public.is_admin());

drop policy if exists "productos_admin_delete" on storage.objects;
create policy "productos_admin_delete" on storage.objects
  for delete using (bucket_id = 'productos' and public.is_admin());
