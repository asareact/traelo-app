import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = { title: "Sobre nosotros — Traelo" };

/** Brand/about page (title shown in the header; body only here). */
export default function SobreNosotrosPage() {
  return (
    <AppShell>
      <p className="text-base font-medium leading-relaxed text-text">
        Traelo nace para que comprar lo que quieres de SHEIN y recibirlo en Cuba
        sea <span className="text-primary">simple, transparente y confiable</span>.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-text">
          Qué hacemos
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Tú nos pasas los enlaces de SHEIN con la talla y el color. Nosotros
          confirmamos el precio real antes de pagar, compramos, y te lo enviamos
          a Cuba. Sigues cada paso con un enlace de seguimiento que puedes
          compartir.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-text">
          Por qué confiar
        </h2>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
          <li>· Precio confirmado antes de cualquier pago, sin sorpresas.</li>
          <li>· Seguimiento en tiempo real de tu pedido hasta la entrega.</li>
          <li>· Evidencia del precio y del peso de tu paquete.</li>
        </ul>
      </section>
    </AppShell>
  );
}
