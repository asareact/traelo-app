import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Logo } from "@/components/brand/logo";
import { BackButton } from "@/components/ui/back-button";
import { routes } from "@/config/site";
import { OrderDetail } from "@/features/orders";
import { getPublicPedido } from "@/features/orders/queries";

export const metadata: Metadata = {
  title: "Detalle del pedido — Traelo",
  robots: { index: false }, // tracking links are private-by-URL, keep them out of search
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
};

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { nuevo } = await searchParams;

  const pedido = await getPublicPedido(id);
  if (!pedido) notFound();

  // Decide the chrome by auth: signed-in users get the full app shell (nav +
  // back arrow); public tracking-link viewers get a standalone header.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const content = <OrderDetail pedido={pedido} nuevo={nuevo === "1"} />;

  if (user) {
    return (
      <AppShell
        back={{
          href: nuevo === "1" ? routes.rastreo : undefined,
          fallbackHref: routes.rastreo,
        }}
      >
        {content}
      </AppShell>
    );
  }

  // Public viewer (no session): standalone header, no bottom nav.
  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2.5 px-5 py-3">
          <BackButton fallbackHref={routes.home} />
          <Link href={routes.home} aria-label="Inicio">
            <Logo variant="auto" size={24} />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md px-5 py-6">{content}</main>
    </div>
  );
}
