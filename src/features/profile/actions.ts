"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/features/profile/schemas";

export type ProfileState = { error?: string; ok?: string };

/** Only allow internal redirect targets (no open-redirect via ?next=). */
function safeNext(value: FormDataEntryValue | null): string | null {
  const v = String(value || "");
  return v.startsWith("/") && !v.startsWith("//") ? v : null;
}

/**
 * Update the logged-in user's profile (nombre, telefono, direccion).
 * `rol` is intentionally not handled — it's protected by a DB trigger.
 * If a valid `next` is provided (the order-flow gate), redirect there on
 * success; otherwise return an ok message so /perfil can show confirmation.
 */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/perfil");

  const parsed = profileSchema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      direccion: parsed.data.direccion || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "No se pudo guardar tu perfil. Intenta de nuevo." };
  }

  revalidatePath("/perfil");
  revalidatePath("/dashboard");

  const next = safeNext(formData.get("next"));
  if (next) redirect(next);

  return { ok: "Perfil actualizado." };
}
