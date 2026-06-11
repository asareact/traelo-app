import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OrderForm } from "@/features/orders";
import {
  completarPerfilHref,
  isProfileComplete,
} from "@/features/profile";
import { getMiPerfil } from "@/features/profile/queries";
import { routes } from "@/config/site";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Nuevo pedido — Traelo" };

export default async function NuevoPedidoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/pedidos/nuevo");

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
      />
    </AppShell>
  );
}
