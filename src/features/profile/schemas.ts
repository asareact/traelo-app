import { z } from "zod";

/**
 * Profile edit schema. Name + phone are required (needed to fulfill an order);
 * address is optional. `rol` is never editable here — it's protected by a DB
 * trigger and simply not part of this form.
 */
export const profileSchema = z.object({
  nombre: z.string().trim().min(1, "Escribe tu nombre").max(80),
  telefono: z
    .string()
    .trim()
    .min(8, "Escribe un teléfono válido")
    .max(25)
    .regex(/^[+\d][\d\s().-]{6,}$/, "Ese teléfono no parece válido"),
  direccion: z.string().trim().max(300).optional().default(""),
});

export type ProfileInput = z.infer<typeof profileSchema>;
