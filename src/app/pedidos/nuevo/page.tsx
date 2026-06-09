import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { OrderForm } from "@/features/orders";

export const metadata: Metadata = { title: "Nuevo pedido — Traelo" };

export default function NuevoPedidoPage() {
  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-text">
          Nuevo pedido
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pega el enlace de cada producto de SHEIN que quieras, con su talla y
          color. Nosotros confirmamos el precio antes de pagar.
        </p>
      </header>

      <OrderForm />
    </AppShell>
  );
}
