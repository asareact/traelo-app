import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth";
import { ProfileForm } from "@/features/profile";
import { getMiPerfil } from "@/features/profile/queries";

export const metadata: Metadata = { title: "Perfil — Traelo" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/perfil");

  const profile = await getMiPerfil();

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-text">Perfil</h1>
        <p className="mt-1 text-sm text-muted">
          Mantén tus datos al día para coordinar tus entregas.
        </p>
      </header>

      <Card className="mb-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Correo</span>
          <span className="text-sm font-medium text-text">{user.email}</span>
        </div>
      </Card>

      <ProfileForm
        initial={{
          nombre: profile?.nombre,
          telefono: profile?.telefono,
          direccion: profile?.direccion,
        }}
      />

      <form action={logout} className="mt-8">
        <Button type="submit" variant="secondary" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </AppShell>
  );
}
