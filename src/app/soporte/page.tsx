import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { IconWhatsapp } from "@/components/brand/icons";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Soporte — Traelo" };

/** Support page: contact via WhatsApp + a couple of quick answers. */
export default async function SoportePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("config")
    .select("value")
    .eq("key", "whatsapp_phone")
    .single();
  const phone = data?.value && data.value !== "0000000000" ? data.value : null;
  const wa = whatsappLink(phone, "Hola, necesito ayuda con mi pedido en Traelo.");

  return (
    <AppShell>
      <p className="text-base font-medium leading-relaxed text-text">
        ¿Tienes una duda con tu pedido? Escríbenos y te ayudamos.
      </p>

      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white transition active:scale-[0.98]"
        >
          <IconWhatsapp size={20} />
          Escribir por WhatsApp
        </a>
      )}

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-text">
          Preguntas frecuentes
        </h2>
        <div className="mt-3 space-y-4">
          <Faq
            q="¿Cuándo pago mi pedido?"
            a="Primero confirmamos el precio real de tus productos. Solo pagas cuando aceptas ese precio; nunca antes."
          />
          <Faq
            q="¿Cómo sigo mi pedido?"
            a="Cada pedido tiene un enlace de seguimiento que puedes abrir y compartir. Ahí ves el estado en tiempo real."
          />
          <Faq
            q="¿Cómo se calcula el envío?"
            a="El envío depende del peso del paquete. Cuando llega a EE.UU. lo pesamos y te compartimos la evidencia."
          />
        </div>
      </section>
    </AppShell>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm font-bold text-text">{q}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{a}</p>
    </div>
  );
}
