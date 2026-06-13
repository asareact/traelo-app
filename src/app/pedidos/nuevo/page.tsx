import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OrderForm } from "@/features/orders";
import { extraerLinkCompartido } from "@/features/orders/domain/shein";
import {
  completarPerfilHref,
  isProfileComplete,
} from "@/features/profile";
import { getMiPerfil } from "@/features/profile/queries";
import { routes } from "@/config/site";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Nuevo pedido — Traelo" };

export default async function NuevoPedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; text?: string; title?: string }>;
}) {
  // Android Share Target sends the shared content here as query params (GET
  // share_target → this page). Pull the first link so a SHEIN product shared from
  // the browser / SHEIN app lands prefilled in the first product.
  const sp = await searchParams;
  const sharedLink = extraerLinkCompartido(sp.url || sp.text);
  // Carry the shared link through login so it isn't lost if they aren't signed in.
  const selfHref = sharedLink
    ? `/pedidos/nuevo?url=${encodeURIComponent(sharedLink)}`
    : "/pedidos/nuevo";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(selfHref)}`);

  // Gate: a name + phone are required before placing an order.
  const profile = await getMiPerfil();
  if (!isProfileComplete(profile)) {
    redirect(completarPerfilHref(routes.nuevoPedido));
  }

  // Business WhatsApp: the order is delivered to the admin by opening a prefilled
  // chat to this number on send.
  const { data: cfg } = await supabase
    .from("config")
    .select("value")
    .eq("key", "whatsapp_phone")
    .single();
  const whatsapp =
    cfg?.value && cfg.value !== "0000000000" ? cfg.value : null;

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-sm text-muted">
          Pega el enlace de cada producto de SHEIN que quieras, con su talla y
          color. Nosotros confirmamos el precio antes de pagar.
        </p>
      </header>

      <OrderForm
        whatsapp={whatsapp}
        nombre={profile?.nombre}
        telefono={profile?.telefono}
        siteUrl={env.NEXT_PUBLIC_SITE_URL ?? null}
        sharedLink={sharedLink}
      />
    </AppShell>
  );
}
