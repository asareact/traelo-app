-- Traelo — shipping type on orders (standard vs express)
-- Additive + backward compatible: existing orders default to 'estandar'.
-- Express is an optional upgrade the client accepts (offered for 10+ lb orders);
-- when set, the admin recomputes total_real_usd to include the express surcharge.
-- Run AFTER 0005_precio_evidencia.sql.

alter table pedidos
  add column if not exists tipo_envio text not null default 'estandar';

-- Guard the allowed values (drop+recreate so re-running this migration is safe).
alter table pedidos drop constraint if exists pedidos_tipo_envio_chk;
alter table pedidos
  add constraint pedidos_tipo_envio_chk
  check (tipo_envio in ('estandar', 'express'));
