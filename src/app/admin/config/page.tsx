import type { Metadata } from "next";
import { ConfigForm } from "@/features/admin";
import { getConfig } from "@/features/admin/queries";

export const metadata: Metadata = { title: "Configuración — Traelo Admin" };

/** Edit the business config: WhatsApp number, price per lb, markup factor. */
export default async function ConfigPage() {
  const config = await getConfig();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-muted">
          Parámetros del negocio. Cambian cómo se calculan y entregan los pedidos.
        </p>
      </div>

      <ConfigForm config={config} />
    </div>
  );
}
