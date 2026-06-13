-- Traelo — store the express surcharge actually charged on each order.
-- Additive + backward compatible: existing orders stay NULL → the invoice falls
-- back to recomputing from config (old behavior). New/updated express orders
-- store the real amount, so the invoice breakdown never drifts if the config
-- rate (recargo_express_por_lb) changes later. Nullable, no default → instant
-- metadata-only change, no table rewrite. Run AFTER 0006_tipo_envio.sql.

alter table pedidos
  add column if not exists recargo_express_usd numeric;
