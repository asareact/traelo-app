import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});

export const signupSchema = z.object({
  nombre: z.string().trim().min(1, "Escribe tu nombre").max(80),
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
