import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Logo } from "@/components/brand/logo";
import { BackButton } from "@/components/ui/back-button";
import { routes } from "@/config/site";
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
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-text">
          Productos
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pedido #{pedido.id.slice(0, 8)} · {pedido.items.length}{" "}
          {pedido.items.length === 1 ? "producto" : "productos"}
        </p>
      </section>
      <ItemListFull items={pedido.items} />
    </>
  );

  const back = { href: routes.pedido(pedido.id), fallbackHref: routes.pedido(pedido.id) };

  // Signed-in users keep the app shell; public viewers get a standalone header.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return <AppShell back={back}>{content}</AppShell>;
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2.5 px-5 py-3">
          <BackButton fallbackHref={routes.pedido(pedido.id)} />
          <Link href={routes.home} aria-label="Inicio">
            <Logo variant="auto" size={24} />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md px-5 py-6">{content}</main>
    </div>
  );
}
