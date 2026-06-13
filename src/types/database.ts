/**
 * Traelo — database row types.
 * Hand-maintained to mirror the Supabase schema (supabase/migrations/).
 * These are pure DATA shapes only. Domain logic (state machine, pricing,
 * labels) lives in features/orders/domain — keep this file logic-free.
 *
 * Regenerate from the live DB later with `supabase gen types` if desired.
 */

import type { Estado } from "@/features/orders/domain/estados";
import type { TipoEnvio } from "@/features/orders/domain/pricing";

export type Rol = "cliente" | "admin";

export interface Profile {
  id: string;
  nombre: string | null;
  telefono: string | null;
  direccion: string | null;
  rol: Rol;
  created_at: string;
}

export interface Pedido {
  id: string;
  user_id: string;
  estado_actual: Estado;
  total_real_usd: number | null;
  /** Shipping type: 'estandar' by default, 'express' once the client upgrades. */
  tipo_envio: TipoEnvio;
  /**
   * Express surcharge actually charged (USD), stored so invoices read it back
   * instead of recomputing from a config rate that may drift. Null = standard
   * order, or a legacy order from before this column (invoice recomputes then).
   */
  recargo_express_usd: number | null;
  nota_admin: string | null;
  // Set by the admin once the package is weighed at the US casillero.
  peso_lb: number | null;
  peso_evidencia_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  // client-filled
  shein_url: string;
  talla: string | null;
  color: string | null;
  cantidad: number;
  notas_cliente: string | null;
  // admin-filled
  producto_nombre: string | null;
  /** Product photo — re-hosted in our `productos` bucket on process. */
  producto_imagen: string | null;
  precio_real_usd: number | null;
  /** Screenshot proof of the product + price at confirmation time. */
  precio_evidencia_url: string | null;
  procesado: boolean;
  created_at: string;
}

export interface EstadoPedido {
  id: string;
  pedido_id: string;
  estado: Estado;
  nota: string | null;
  created_at: string;
}

export interface Notificacion {
  id: string;
  user_id: string;
  pedido_id: string | null;
  tipo: string;
  mensaje: string | null;
  enviado: boolean;
  created_at: string;
}

export interface Config {
  key: string;
  value: string;
  descripcion: string | null;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

/** A full order with its items + state history — the tracking-page shape. */
export interface PedidoCompleto extends Pedido {
  items: PedidoItem[];
  historial: EstadoPedido[];
}
