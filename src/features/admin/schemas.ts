/**
 * Admin input schemas. Every admin write is validated here server-side (the
 * trust boundary), even though the UI also guides input.
 */

import { z } from "zod";
import { ESTADOS } from "@/features/orders/domain/estados";

/** Saving a processed item: name + real USD price + image are all required. */
export const processItemSchema = z.object({
  itemId: z.string().uuid("Item inválido."),
  producto_nombre: z
    .string()
    .trim()
    .min(2, "El nombre es muy corto.")
    .max(200, "El nombre es muy largo."),
  precio_real_usd: z.coerce
    .number({ message: "Precio inválido." })
    .positive("El precio debe ser mayor que 0.")
    .max(100000, "Precio fuera de rango."),
  producto_imagen: z
    .string()
    .trim()
    .url("La imagen debe ser una URL válida.")
    .max(2000),
  precio_evidencia_url: z
    .string()
    .trim()
    .url("Evidencia inválida.")
    .max(2000)
    .optional()
    .or(z.literal("")),
});

export type ProcessItemInput = z.infer<typeof processItemSchema>;

/** Moving an order to a new state (optionally with an admin note). */
export const advanceStateSchema = z.object({
  pedidoId: z.string().uuid("Pedido inválido."),
  nuevoEstado: z.enum(ESTADOS),
  nota: z.string().trim().max(500).optional().or(z.literal("")),
});

export type AdvanceStateInput = z.infer<typeof advanceStateSchema>;

/** Registering the package weight (+ optional evidence photo URL). */
export const registrarPesoSchema = z.object({
  pedidoId: z.string().uuid("Pedido inválido."),
  peso_lb: z.coerce
    .number({ message: "Peso inválido." })
    .positive("El peso debe ser mayor que 0.")
    .max(1000, "Peso fuera de rango."),
  evidencia_url: z
    .string()
    .trim()
    .url("Evidencia inválida.")
    .max(2000)
    .optional()
    .or(z.literal("")),
});

export type RegistrarPesoInput = z.infer<typeof registrarPesoSchema>;

/** The curl-extract request (the URL host is re-checked server-side). */
export const extractCurlSchema = z.object({
  curl: z.string().trim().min(10, "Pega el comando curl completo."),
});
