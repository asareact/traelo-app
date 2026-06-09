import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Alert } from "@/components/ui/alert";
import { ProfileForm, isProfileComplete } from "@/features/profile";
import { getMiPerfil } from "@/features/profile/queries";

export const metadata: Metadata = { title: "Completa tu perfil — Traelo" };

type Props = { searchParams: Promise<{ next?: string }> };

/**
 * Forced profile step before ordering. If the profile is already complete and
 * a `next` target was provided, skip straight through. Otherwise show the form
 * pre-filled with whatever data exists and return the user to `next` on save.
 */
export default async function CompletarPerfilPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/perfil/completar");

  const { next: rawNext } = await searchParams;
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/pedidos/nuevo";

  const profile = await getMiPerfil();
  if (isProfileComplete(profile)) redirect(next);

  return (
    <AppShell>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold text-text">
          Completa tu perfil
        </h1>
        <p className="mt-1 text-sm text-muted">
          Necesitamos tu nombre y teléfono para procesar tu pedido y coordinar
          la entrega. Lo haces una sola vez.
        </p>
      </header>

      <Alert tone="info" className="mb-5">
        Falta poco. Llena estos datos y seguimos con tu pedido.
      </Alert>

      <ProfileForm
        initial={{
          nombre: profile?.nombre,
          telefono: profile?.telefono,
          direccion: profile?.direccion,
        }}
        next={next}
        submitLabel="Guardar y continuar"
      />
    </AppShell>
  );
}
