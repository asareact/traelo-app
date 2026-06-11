import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { OrderForm } from "@/features/orders";
import { permiteEdicionCliente } from "@/features/orders/domain/estados";
import type { PedidoItem } from "@/types/database";

export const metadata: Metadata = {
  title: "Editar pedido — Traelo",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

/**
 * Edit one of the caller's own orders — only the owner, and only while it's in
 * the quote window. RLS already scopes the read to the owner; we double-check
 * ownership and bounce to the detail page if it's past the editable window.
 */
export default async function EditarPedidoPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/pedidos/${id}/editar`);

  const { data } = await supabase
    .from("pedidos")
    .select("id, user_id, estado_actual, pedido_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!data || data.user_id !== user.id) notFound();
  if (!permiteEdicionCliente(data.estado_actual)) {
    redirect(`/pedidos/${id}`);
  }

  const items = [...((data.pedido_items as PedidoItem[]) ?? [])]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((it) => ({
      shein_url: it.shein_url,
      talla: it.talla ?? "",
      color: it.color ?? "",
      cantidad: it.cantidad,
      notas_cliente: it.notas_cliente ?? "",
    }));

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-sm text-muted">
          Cambia, agrega o quita productos. Volveremos a confirmarte el precio
          con estos cambios antes de pagar.
        </p>
      </header>

      <OrderForm mode="edit" orderId={id} initialItems={items} />
    </AppShell>
  );
}
