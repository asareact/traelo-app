import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing placeholder. The full 9-section landing (per DESIGN.md) ships in the
 * next block. For now: brand + the two primary entry points.
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-dvh flex-col bg-[#1c1714] text-[#f0ebe0]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="font-display text-2xl font-bold text-primary">
          traelo.
        </span>
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Mi panel
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-[#f0ebe0]"
          >
            Entrar
          </Link>
        )}
      </nav>

      {/* Hero */}
      <div className="flex flex-1 flex-col justify-center px-6 pb-20 pt-10 sm:px-12">
        <div className="max-w-2xl">
          <span className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold text-accent">
            ● Pedidos de SHEIN a Cuba
          </span>
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            Tu pedido de
            <br />
            SHEIN llega a{" "}
            <em className="not-italic text-primary">Cuba.</em>
          </h1>
          <p className="mt-5 max-w-md text-base text-[#8c7f76] sm:text-lg">
            Pega el link, elige tu talla. Nosotros compramos y enviamos, con
            tracking en tiempo real. Sin transferencias a ciegas.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={user ? "/pedidos/nuevo" : "/login?next=/pedidos/nuevo"}
              className="rounded-full bg-primary px-8 py-4 text-base font-bold text-white transition hover:opacity-90"
            >
              Hacer mi pedido →
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/25 px-8 py-4 text-base font-bold text-[#f0ebe0] transition hover:bg-white/5"
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
