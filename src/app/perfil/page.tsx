import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth";

export const metadata: Metadata = { title: "Perfil — Traelo" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/perfil");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, telefono, direccion, rol")
    .eq("id", user.id)
    .single();

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-text">Perfil</h1>
      </header>

      <Card className="flex flex-col gap-4">
        <Row label="Nombre" value={profile?.nombre} />
        <Row label="Correo" value={user.email} />
        <Row label="Teléfono" value={profile?.telefono} />
        <Row label="Dirección" value={profile?.direccion} />
        {profile?.rol === "admin" && <Row label="Rol" value="Administrador" />}
      </Card>

      <form action={logout} className="mt-6">
        <Button type="submit" variant="secondary" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-text">
        {value || <span className="text-muted">—</span>}
      </span>
    </div>
  );
}
