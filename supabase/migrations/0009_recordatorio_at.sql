-- Traelo — throttle for push reminders (Fase 3 cron). Tracks the last time we
-- reminded about an order, so the daily cron re-reminds at most every few days
-- instead of every run. Nullable + additive. Run AFTER 0008_push_subscriptions.sql.

alter table pedidos
  add column if not exists recordatorio_at timestamptz;
