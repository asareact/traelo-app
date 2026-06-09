"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/features/auth/schemas";

export type AuthState = { error?: string; ok?: string };

/** Sign in with email + password. (useActionState signature) */
export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa tus datos." };
  }
  const next = String(formData.get("next") || "/dashboard");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: traducirError(error.message) };

  revalidatePath("/", "layout");
  redirect(next);
}

/** Create a new account. (useActionState signature) */
export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmar: formData.get("confirmar"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Completa todos los campos.",
    };
  }
  const { nombre, email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });

  if (error) return { error: traducirError(error.message) };

  // Supabase hides "email already registered" to prevent enumeration: it returns
  // a user with an empty `identities` array (and no session) instead of an error.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return {
      error: "Ya existe una cuenta con ese correo. Inicia sesión.",
    };
  }

  // Email confirmation enabled → no session yet. Tell the user to check inbox.
  if (!data.session) {
    return {
      ok: "¡Cuenta creada! Revisa tu correo para confirmar y luego entra.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Sign out and return to the landing page. */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Map common Supabase auth errors to friendly Spanish messages. */
function traducirError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (m.includes("user already registered"))
    return "Ya existe una cuenta con ese correo. Inicia sesión.";
  if (m.includes("email not confirmed"))
    return "Confirma tu correo antes de entrar.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos. Espera un momento.";
  return "Algo salió mal. Intenta de nuevo.";
}
