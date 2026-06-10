import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Logo } from "@/components/brand/logo";
import { BackButton } from "@/components/ui/back-button";
import { routes } from "@/config/site";
import { IconSparkle } from "@/components/brand/icons";
import { ItemListFull } from "@/features/orders";
import { getPublicPedido } from "@/features/orders/queries";

export const metadata: Metadata = {
  title: "Productos del pedido — Traelo",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

/** Full product list for an order (big images + details). Public by UUID. */
export default async function OrderProductsPage({ params }: Props) {
  const { id } = await params;
  const pedido = await getPublicPedido(id);
  if (!pedido) notFound();

  const content = (
    <>
      <section className="mb-6">
        <p className="text-sm text-muted">
          Pedido #{pedido.id.slice(0, 8)} ·{" "}
          <span className="text-primary">
            {pedido.items.length}{" "}
            {pedido.items.length === 1 ? "producto" : "productos"}
          </span>
        </p>
      </section>

      <ItemListFull items={pedido.items} />

      {/* Reassurance tip */}
      <div className="mt-10 flex items-center gap-4 rounded-[32px] border-2 border-dashed border-border bg-bg p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <IconSparkle size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-text">
            ¡Tu pedido está en buenas manos!
          </p>
          <p className="mt-0.5 text-xs leading-tight text-muted">
            Guardamos la evidencia del precio de cada producto para tu
            tranquilidad.
          </p>
        </div>
      </div>
    </>
  );

  // Signed-in users keep the app shell; public viewers get a standalone header.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return <AppShell>{content}</AppShell>;
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-2.5 px-5 py-3">
          <BackButton fallbackHref={routes.pedido(pedido.id)} />
          <span className="text-[15px] font-bold text-text">Productos</span>
          <Link href={routes.home} aria-label="Inicio" className="ml-auto">
            <Logo variant="auto" size={24} />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md px-5 py-6">{content}</main>
    </div>
  );
}
