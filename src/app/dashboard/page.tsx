import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { Logo } from "@/components/logo";

/**
 * Dashboard placeholder. Full client dashboard (orders list, stats, bottom tab
 * bar) ships in a later block. For now: confirm auth works + logout.
 */
export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex min-h-dvh flex-col bg-bg px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <Logo variant="dark" size={30} />

        <div className="mt-8 rounded-lg border border-border bg-surface p-6">
          <p className="text-sm text-muted">Hola,</p>
          <h1 className="font-display text-2xl font-bold text-text">
            {profile?.nombre || user.email}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Rol: {profile?.rol === "admin" ? "Administrador" : "Cliente"}
          </p>
        </div>

        <p className="mt-6 text-sm text-muted">
          Tu panel de pedidos llegará pronto. Por ahora la cuenta ya funciona.
        </p>

        <form action={logout} className="mt-8">
          <button
            type="submit"
            className="rounded-full border-[1.5px] border-border bg-bg px-5 py-2.5 text-sm font-bold text-text transition hover:bg-surface"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
