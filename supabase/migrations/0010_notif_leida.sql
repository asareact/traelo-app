-- Traelo — in-app notifications: read state + let users manage their own rows.
-- Rows are created by server actions via the service-role client (bypasses RLS);
-- the user only needs to mark-as-read (update) and clear (delete) their own.
-- Run AFTER 0009_recordatorio_at.sql.

alter table notificaciones
  add column if not exists leida boolean not null default false;

create index if not exists idx_notif_user_no_leida
  on notificaciones(user_id) where leida = false;

drop policy if exists "notif_update_own" on notificaciones;
create policy "notif_update_own" on notificaciones
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notif_delete_own" on notificaciones;
create policy "notif_delete_own" on notificaciones
  for delete using (auth.uid() = user_id);
