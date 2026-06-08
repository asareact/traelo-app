/**
 * Traelo — shared domain types.
 * Hand-maintained to match the Supabase schema (supabase/migrations/).
 * Regenerate from DB later with `supabase gen types` if desired.
 */

export type Rol = "cliente" | "admin";

export const ESTADOS = [
  "COTIZACION",
  "EN_REVISION",
  "PRECIO_ACTUALIZADO",
  "ACEPTADO",
  "PENDIENTE_PAGO",
  "PAGADO",
  "COMPRADO_SHEIN",
  "EN_CAMINO_CASILLERO",
  "EN_CASILLERO",
  "CONSOLIDANDO",
  "ENVIADO_CUBA",
  "EN_TRANSITO_INTERNO",
  "DISPONIBLE_ENTREGA",
  "ENTREGADO",
  "CANCELADO",
] as const;

export type Estado = (typeof ESTADOS)[number];

/** Human-readable labels for each state (UI display). */
export const ESTADO_LABEL: Record<Estado, string> = {
  COTIZACION: "Cotización",
  EN_REVISION: "En revisión",
  PRECIO_ACTUALIZADO: "Precio actualizado",
  ACEPTADO: "Aceptado",
  PENDIENTE_PAGO: "Pendiente de pago",
  PAGADO: "Pagado",
  COMPRADO_SHEIN: "Comprado en SHEIN",
  EN_CAMINO_CASILLERO: "En camino al casillero",
  EN_CASILLERO: "En el casillero",
  CONSOLIDANDO: "Consolidando",
  ENVIADO_CUBA: "Enviado a Cuba",
  EN_TRANSITO_INTERNO: "En tránsito interno",
  DISPONIBLE_ENTREGA: "Disponible para entrega",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

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
  nota_admin: string | null;
  created_at: string;
  updated_at: string;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  shein_url: string;
  talla: string | null;
  color: string | null;
  cantidad: number;
  notas_cliente: string | null;
  producto_nombre: string | null;
  producto_imagen: string | null;
  precio_real_usd: number | null;
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
