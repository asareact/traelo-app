import { z } from "zod";

/**
 * Validation schemas for order creation. Used by the server action (trust
 * boundary) and re-used client-side for inline feedback. One definition,
 * validated on both sides.
 */

export const itemSchema = z.object({
  shein_url: z
    .string()
    .trim()
    .min(1, "Pega el enlace del producto")
    .url("Ese enlace no es válido")
    .max(2000),
  talla: z.string().trim().max(60).optional().default(""),
  color: z.string().trim().max(60).optional().default(""),
  cantidad: z.coerce
    .number()
    .int("Cantidad inválida")
    .min(1, "Mínimo 1")
    .max(20, "Máximo 20 por producto"),
  notas_cliente: z.string().trim().max(500).optional().default(""),
});

export type ItemInput = z.infer<typeof itemSchema>;

export const createOrderSchema = z.object({
  items: z
    .array(itemSchema)
    .min(1, "Agrega al menos un producto")
    .max(30, "Máximo 30 productos por pedido"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** A blank item row for the form's initial state. */
export const emptyItem: ItemInput = {
  shein_url: "",
  talla: "",
  color: "",
  cantidad: 1,
  notas_cliente: "",
};
