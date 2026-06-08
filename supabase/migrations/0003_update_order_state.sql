-- Traelo — Atomic state transition function
-- Updates pedidos.estado_actual AND inserts into estados_pedido in one
-- transaction. Either both succeed or neither does.
-- Run AFTER 0002_rls_policies.sql.

-- Valid states (negotiation + logistics + terminal).
create or replace function public.valid_estados()
returns text[]
language sql
immutable
as $$
  select array[
    'COTIZACION', 'EN_REVISION', 'PRECIO_ACTUALIZADO', 'ACEPTADO', 'PENDIENTE_PAGO',
    'PAGADO', 'COMPRADO_SHEIN', 'EN_CAMINO_CASILLERO', 'EN_CASILLERO',
    'CONSOLIDANDO', 'ENVIADO_CUBA', 'EN_TRANSITO_INTERNO',
    'DISPONIBLE_ENTREGA', 'ENTREGADO', 'CANCELADO'
  ];
$$;

create or replace function public.update_order_state(
  p_pedido_id uuid,
  p_nuevo_estado text,
  p_nota text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only admins may transition states.
  if not public.is_admin() then
    raise exception 'No autorizado: solo el admin puede cambiar estados';
  end if;

  -- Validate the target state.
  if not (p_nuevo_estado = any (public.valid_estados())) then
    raise exception 'Estado inválido: %', p_nuevo_estado;
  end if;

  -- Atomic: update header + append history.
  update pedidos
    set estado_actual = p_nuevo_estado,
        updated_at = now()
    where id = p_pedido_id;

  if not found then
    raise exception 'Pedido no encontrado: %', p_pedido_id;
  end if;

  insert into estados_pedido (pedido_id, estado, nota)
    values (p_pedido_id, p_nuevo_estado, p_nota);
end;
$$;
