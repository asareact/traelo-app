"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; ok?: string };

/** Sign in with email + password. (useActionState signature) */
export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");

  if (!email || !password) {
    return { error: "Completa el correo y la contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traducirError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

/** Create a new account. (useActionState signature) */
export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nombre = String(formData.get("nombre") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!nombre || !email || !password) {
    return { error: "Completa todos los campos." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });

  if (error) {
    return { error: traducirError(error.message) };
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
