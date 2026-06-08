import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // WhatsApp number from config (public read). Falls back gracefully.
  const { data: cfg } = await supabase
    .from("config")
    .select("value")
    .eq("key", "whatsapp_phone")
    .single();
  const whatsapp = cfg?.value && cfg.value !== "0000000000" ? cfg.value : null;
  const waHref = whatsapp ? `https://wa.me/${whatsapp}` : "#contacto";

  const pedidoHref = user ? "/pedidos/nuevo" : "/login?next=/pedidos/nuevo";

  return (
    <div className="bg-bg text-text">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#1c1714]/95 px-6 py-4 backdrop-blur">
        <Logo variant="light" size={32} />
        <div className="hidden items-center gap-6 text-sm font-semibold text-[#8c7f76] md:flex">
          <a href="#como-funciona" className="hover:text-[#f0ebe0]">
            ¿Cómo funciona?
          </a>
          <a href="#precios" className="hover:text-[#f0ebe0]">
            Precios
          </a>
          <a href="#tiempos" className="hover:text-[#f0ebe0]">
            Tiempos
          </a>
          <a href="#como-pago" className="hover:text-[#f0ebe0]">
            Pagos
          </a>
          <a href="#faq" className="hover:text-[#f0ebe0]">
            FAQ
          </a>
        </div>
        <Link
          href={pedidoHref}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
        >
          Hacer un pedido
        </Link>
      </nav>

      {/* ─── 1. HERO ─── */}
      <section
        className="flex min-h-[92svh] flex-col justify-end px-6 pb-14 pt-10 text-[#f0ebe0] sm:px-12"
        style={{
          background:
            "linear-gradient(155deg, #2A1A12 0%, #1C1714 45%, #081410 100%)",
        }}
      >
        <div className="max-w-3xl">
          <span className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold text-accent">
            ● 247 pedidos entregados exitosamente
          </span>
          <h1 className="font-display text-6xl font-extrabold leading-[1.0] tracking-tight sm:text-8xl">
            Tu pedido de
            <br />
            SHEIN llega a{" "}
            <em className="not-italic text-primary">Cuba.</em>
          </h1>
          <p className="mt-5 max-w-md text-base text-[#8c7f76] sm:text-lg">
            Pega el link del producto que quieres. Nosotros lo compramos, lo
            enviamos, y tú ves cada paso en tiempo real. Sin transferencias a
            ciegas, sin semanas de silencio.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={pedidoHref}
              className="rounded-full bg-primary px-8 py-4 text-base font-bold text-white transition hover:opacity-90"
            >
              Hacer mi pedido →
            </Link>
            <a
              href="#como-funciona"
              className="rounded-full border border-white/25 px-8 py-4 text-base font-bold text-[#f0ebe0] transition hover:bg-white/5"
            >
              ¿Cómo funciona?
            </a>
          </div>
          <div className="mt-14 flex flex-wrap gap-10 border-t border-white/10 pt-8">
            <Stat n="$7" l="USD por libra" />
            <Stat n="22-35" l="días promedio" />
            <Stat n="98%" l="pedidos entregados" />
            <Stat n="5-7 días" l="express (10+ lbs)" />
          </div>
        </div>
      </section>

      {/* ─── 2. CÓMO FUNCIONA ─── */}
      <section id="como-funciona" className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Label>Proceso</Label>
          <Title>5 pasos. Sin complicaciones.</Title>
          <Sub>
            Desde que pegas el link hasta que recibes el paquete, todo queda
            registrado y visible para ti.
          </Sub>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <Step n="1" t="Pega el link de SHEIN">
              Copia el link del producto. Elige talla, color y cantidad. Puedes
              agregar varios productos en un solo pedido.
            </Step>
            <Step n="2" t="Recibe el precio real">
              El admin verifica el precio real en SHEIN en menos de 24 horas y te
              lo envía con evidencia. Aceptas o seguimos negociando.
            </Step>
            <Step n="3" t="Pagas y compramos">
              Una vez confirmado el precio, pagas. Compramos en SHEIN y guardamos
              el comprobante y los artículos.
            </Step>
            <Step n="4" t="Sigue tu pedido en vivo" accent>
              Casillero EE.UU. → empaque → envío a Cuba. Cada estado se actualiza
              en tu link de tracking. Compártelo con quien quieras.
            </Step>
            <Step n="5" t="Recibes y pagas las libras" accent>
              Cuando el paquete llega, te enviamos el peso real con foto. Pagas
              las libras y coordinas la entrega.
            </Step>
          </div>
        </div>
      </section>

      {/* ─── 3. POR QUÉ TRAELO ─── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Label>Diferencia</Label>
          <Title>¿Por qué Traelo y no el revendedor de Facebook?</Title>
          <Sub>La experiencia que mereces cuando confías tu dinero a alguien.</Sub>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border-[1.5px] border-red-300 bg-red-50 p-7">
              <h3 className="mb-5 font-display text-lg font-bold text-red-800">
                ❌ Revendedor de Facebook
              </h3>
              {[
                "Mandas screenshots por WhatsApp y esperas respuesta",
                "El precio cambia sin aviso previo",
                "Transferencia a ciegas sin comprobante",
                "No sabes dónde está tu pedido en ningún momento",
                "Si hay problema, no tienes nada por escrito",
                "Peso del paquete no verificable",
              ].map((t) => (
                <Bad key={t}>{t}</Bad>
              ))}
            </div>
            <div className="rounded-lg border-[1.5px] border-accent/25 bg-accent/5 p-7">
              <h3 className="mb-5 font-display text-lg font-bold text-accent">
                ✓ Traelo
              </h3>
              {[
                "Formulario estructurado, sin va-y-ven de mensajes",
                "Precio confirmado con captura real de SHEIN",
                "Comprobante del pago en SHEIN guardado en tu pedido",
                "Link de tracking actualizado en cada paso",
                "Todo queda registrado: artículos, precios, pagos",
                "Foto del peso real del paquete como evidencia",
              ].map((t) => (
                <Good key={t}>{t}</Good>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. CATEGORÍAS ─── */}
      <section className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Label>Productos</Label>
          <Title>¿Qué puedes pedir?</Title>
          <Sub>
            Todo lo que vende SHEIN. El peso estimado determina el costo de envío
            por libra.
          </Sub>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Cat icon="👗" name="Ropa" peso="~0.3 lbs por pieza" />
            <Cat icon="👟" name="Calzado" peso="~0.8 lbs por par" />
            <Cat icon="💄" name="Belleza" peso="~0.4 lbs por item" />
            <Cat icon="👜" name="Accesorios" peso="~0.2 lbs por item" />
            <Cat icon="🏠" name="Hogar" peso="Variable según item" />
            <div className="flex flex-col gap-3 rounded-lg border border-accent bg-accent/5 p-6">
              <span className="text-3xl">📦</span>
              <span className="font-display text-lg font-bold">
                Pedido +10 lbs
              </span>
              <span className="text-xs text-muted">Descuento automático</span>
              <span className="text-sm font-bold text-accent">
                Express disponible{" "}
                <span className="font-normal text-muted">· 5-7 días Cuba</span>
              </span>
            </div>
          </div>
          <p className="mt-5 text-sm text-muted">
            * El peso real se confirma cuando el paquete llega al casillero. Se
            envía foto como evidencia. Puedes verificarlo en persona al recoger.
          </p>
        </div>
      </section>

      {/* ─── 5. PRECIOS ─── */}
      <section id="precios" className="bg-text px-6 py-20 text-[#f0ebe0]">
        <div className="mx-auto max-w-4xl">
          <Label dark>Tarifas</Label>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Precios claros, sin sorpresas.
          </h2>
          <p className="mt-3 max-w-xl text-base text-[#8c7f76]">
            El precio del envío se calcula por el peso real del paquete. Lo
            mínimo es 1 libra. Siempre con evidencia fotográfica.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8c7f76]">
                Envío estándar
              </p>
              <div className="font-display text-5xl font-extrabold">$7</div>
              <p className="mb-5 mt-1 text-[#8c7f76]">por libra · mínimo 1 lb</p>
              {[
                "Cualquier peso",
                "SHEIN: 15-20 días",
                "Cuba: 7-15 días",
                "Foto del peso como evidencia",
                "Links reales de cada artículo guardados",
                "Tracking en tiempo real",
              ].map((t) => (
                <Feat key={t}>{t}</Feat>
              ))}
            </div>
            <div className="rounded-lg bg-primary p-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/70">
                Express — pedidos +10 lbs
              </p>
              <div className="font-display text-5xl font-extrabold">$7</div>
              <p className="mb-5 mt-1 text-white/70">por libra + tarifa express</p>
              {[
                "Solo para pedidos de 10+ lbs",
                "SHEIN: 15-20 días (igual)",
                "Cuba: 5-7 días",
                "Descuento automático por volumen",
                "Todo lo del estándar incluido",
              ].map((t) => (
                <Feat key={t} onPrimary>
                  {t}
                </Feat>
              ))}
            </div>
          </div>
          <p className="mt-8 text-xs leading-relaxed text-[#6b6460]">
            * Los tiempos indicados son estimados pesimistas. En la práctica
            suelen ser menores. El pago de libras se realiza cuando el paquete
            llega al casillero, no por adelantado.
          </p>
        </div>
      </section>

      {/* ─── 6. TIEMPOS ─── */}
      <section id="tiempos" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Label>Tiempos de entrega</Label>
          <Title>¿Cuándo llega tu pedido?</Title>
          <Sub>
            Tiempos estimados pesimistas. Lo habitual es que lleguen antes.
            Depende de la época del año y el tamaño del envío.
          </Sub>
          <div className="mt-6 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface">
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="p-4 font-bold">Tramo</th>
                  <th className="p-4 font-bold">Estándar</th>
                  <th className="p-4 font-bold">Express (10+ lbs)</th>
                </tr>
              </thead>
              <tbody>
                <TiempoRow
                  tramo="SHEIN → Casillero EE.UU."
                  desc="Lo que tarda SHEIN en enviar a nuestro casillero en Florida"
                  std="15-20 días"
                  exp="15-20 días"
                  expTag="No cambia"
                />
                <TiempoRow
                  tramo="Casillero → Cuba"
                  desc="Desde que consolidamos hasta que llega a Cuba"
                  std="7-15 días"
                  exp="5-7 días"
                  expTag="Express"
                />
                <tr>
                  <td className="p-4 align-top">
                    <div className="font-bold text-primary">Total estimado</div>
                    <div className="mt-1 text-xs text-muted">
                      Desde que pagas hasta que lo tienes
                    </div>
                  </td>
                  <td className="p-4 align-top font-display text-lg font-bold">
                    22-35 días
                  </td>
                  <td className="p-4 align-top font-display text-lg font-bold text-accent">
                    20-27 días
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted">
            En temporada alta (noviembre-enero) pueden ser 5-7 días más.
          </p>
        </div>
      </section>

      {/* ─── 7. CÓMO PAGO ─── */}
      <section id="como-pago" className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <Label>Pagos</Label>
          <Title>¿Cómo se paga?</Title>
          <Sub>
            Dos momentos de pago. Todo por canales acordados por WhatsApp, sin
            plataformas intermediarias.
          </Sub>
          <div className="mt-10">
            <Pago n="1" t="Haces el pedido — queda reservado">
              Tu pedido se registra con todos los artículos, tallas y colores. El
              admin verifica los precios reales en SHEIN y te los envía en menos
              de 24 horas.
            </Pago>
            <Pago
              n="2"
              t="Pago de los artículos SHEIN"
              note="📋 Guardamos el comprobante del pago en SHEIN y los links reales de cada artículo para que los consultes cuando quieras."
            >
              Cuando aceptas el precio confirmado, pagas el total de los
              artículos por el canal que acordemos (Zelle, transferencia, MLC…).
              El pedido queda en espera hasta confirmar el pago.
            </Pago>
            <Pago
              n="3"
              t="El paquete llega al casillero"
              accent
              note="⚖️ Artículos menores a 1 lb se cobran como 1 lb. Pedidos de más de 10 lbs tienen descuento automático."
            >
              Cuando el paquete llega a Florida, lo pesamos y te enviamos la foto
              del peso como evidencia. Puedes verificarlo en persona al momento
              de la entrega.
            </Pago>
            <Pago n="4" t="Pago de las libras y entrega" accent last>
              Pagas las libras según el peso real confirmado ($7 USD/lb).
              Coordinas la entrega o el envío dentro de Cuba.
            </Pago>
          </div>
        </div>
      </section>

      {/* ─── 8. FAQ ─── */}
      <section id="faq" className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <Label>Preguntas frecuentes</Label>
          <Title>Lo que todos preguntan</Title>
          <div className="mt-8 border-t border-border">
            <Faq q="¿Puedo pedir cualquier cosa de SHEIN?">
              Sí, cualquier artículo: ropa, calzado, accesorios, belleza, hogar.
              Pega el link directamente desde SHEIN. Si dudas sobre un artículo
              específico, escríbenos por WhatsApp antes de pedirlo.
            </Faq>
            <Faq q="¿Cómo sé que el precio es el real?">
              El admin verifica el precio directamente en SHEIN y te envía una{" "}
              <strong className="text-text">captura como evidencia</strong> antes
              de que pagues. Solo cuando aceptas ese precio se procede al cobro.
            </Faq>
            <Faq q="¿Cómo sé el peso antes de pagar las libras?">
              El peso estimado por categoría te da una idea al hacer el pedido. El
              peso real lo confirmamos cuando el paquete llega al casillero y te
              enviamos{" "}
              <strong className="text-text">foto del pesaje</strong>. Pagas las
              libras después de ver el peso real, nunca antes. Si recoges en
              persona, puedes pesarlo tú mismo.
            </Faq>
            <Faq q="¿Qué pasa con las aduanas cubanas?">
              Los envíos se manejan por canales con experiencia en envíos a Cuba.
              Los artículos de uso personal generalmente no tienen problemas.
              Artículos electrónicos o de alto valor pueden tener restricciones,
              consulta antes de pedirlos.
            </Faq>
            <Faq q="¿Puedo ver los artículos que pedí después?">
              Sí. Cada artículo guarda el{" "}
              <strong className="text-text">link real a SHEIN</strong> para que lo
              veas cuando quieras. Si el link expira, tienes la captura guardada.
            </Faq>
            <Faq q="¿Puedo cancelar un pedido?">
              Puedes cancelar sin costo mientras esté en cotización o revisión
              (antes de pagar). Una vez pagado y comprado en SHEIN no es posible,
              porque SHEIN no acepta devoluciones a casilleros internacionales.
            </Faq>
            <Faq q="¿Cuándo está disponible el envío express?">
              El express a Cuba (5-7 días) está disponible para{" "}
              <strong className="text-text">pedidos de 10 libras o más</strong>. Se
              ofrece automáticamente al confirmar el envío.
            </Faq>
            <Faq q="¿Y si llega dañado o con artículos incorrectos?">
              Guardamos evidencia fotográfica del contenido al recibirlo en el
              casillero. Si hay algo incorrecto o dañado, lo notificamos antes del
              envío a Cuba y tenemos la documentación para resolver.
            </Faq>
          </div>
        </div>
      </section>

      {/* ─── 9. CTA FINAL ─── */}
      <section
        id="contacto"
        className="px-6 py-20 text-center text-[#f0ebe0]"
        style={{
          background: "linear-gradient(135deg, #2A1A12 0%, #1C1714 100%)",
        }}
      >
        <div className="mx-auto max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">
            Empieza hoy
          </p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            ¿Listo para hacer tu pedido?
          </h2>
          <p className="mx-auto mb-10 mt-3 max-w-md text-base text-[#8c7f76]">
            Pega el link de SHEIN, elige tu talla, y nosotros hacemos el resto.
            Precio confirmado en menos de 24 horas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={pedidoHref}
              className="rounded-full bg-primary px-8 py-4 text-base font-bold text-white transition hover:opacity-90"
            >
              Hacer mi pedido →
            </Link>
            <a
              href={waHref}
              className="rounded-full border px-8 py-4 text-base font-bold transition hover:bg-white/5"
              style={{ borderColor: "rgba(37,211,102,0.5)", color: "#25D366" }}
            >
              💬 Preguntar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-text px-6 py-10 text-[#6b6460]">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <Logo variant="light" size={28} />
              <p className="mt-2 text-sm">
                Pedidos de SHEIN a Cuba con transparencia real.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <a
                href={waHref}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
                style={{ background: "#25D366" }}
              >
                💬 WhatsApp
              </a>
              <div className="flex flex-wrap gap-5 text-sm">
                <a href="#como-funciona" className="hover:text-[#f0ebe0]">
                  ¿Cómo funciona?
                </a>
                <a href="#precios" className="hover:text-[#f0ebe0]">
                  Precios
                </a>
                <a href="#faq" className="hover:text-[#f0ebe0]">
                  FAQ
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-6 text-xs">
            <span>© 2026 Traelo. Todos los derechos reservados.</span>
            <span>traelo.app</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── helpers ─────────── */

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold text-[#f0ebe0]">{n}</div>
      <div className="mt-1 text-xs text-[#6b6460]">{l}</div>
    </div>
  );
}

function Label({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-widest ${
        dark ? "text-accent" : "text-muted"
      }`}
    >
      {children}
    </p>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
      {children}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-xl text-base text-muted">{children}</p>;
}

function Step({
  n,
  t,
  accent,
  children,
}: {
  n: string;
  t: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full font-display text-lg font-bold text-white ${
          accent ? "bg-accent" : "bg-primary"
        }`}
      >
        {n}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{t}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}

function Bad({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex gap-2 text-sm leading-snug">
      <span className="text-red-400">✗</span>
      <span>{children}</span>
    </p>
  );
}

function Good({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex gap-2 text-sm leading-snug">
      <span className="text-accent">✓</span>
      <span>{children}</span>
    </p>
  );
}

function Cat({
  icon,
  name,
  peso,
}: {
  icon: string;
  name: string;
  peso: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-white/40 p-6">
      <span className="text-3xl">{icon}</span>
      <span className="font-display text-lg font-bold">{name}</span>
      <span className="text-xs text-muted">{peso}</span>
      <span className="text-sm font-bold text-primary">
        $7.00 <span className="font-normal text-muted">por libra · mín. 1 lb</span>
      </span>
    </div>
  );
}

function Feat({
  children,
  onPrimary,
}: {
  children: React.ReactNode;
  onPrimary?: boolean;
}) {
  return (
    <p
      className={`mb-2.5 flex gap-2 text-sm ${
        onPrimary ? "text-white/90" : "text-[#d4cec8]"
      }`}
    >
      <span className={onPrimary ? "text-white/70" : "text-accent"}>✓</span>
      <span>{children}</span>
    </p>
  );
}

function TiempoRow({
  tramo,
  desc,
  std,
  exp,
  expTag,
}: {
  tramo: string;
  desc: string;
  std: string;
  exp: string;
  expTag: string;
}) {
  return (
    <tr className="border-t border-border">
      <td className="p-4 align-top">
        <div className="font-bold">{tramo}</div>
        <div className="mt-1 text-xs text-muted">{desc}</div>
      </td>
      <td className="p-4 align-top">
        <div className="font-bold">{std}</div>
      </td>
      <td className="p-4 align-top">
        <div className="font-bold">{exp}</div>
        <span className="mt-1 inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
          {expTag}
        </span>
      </td>
    </tr>
  );
}

function Pago({
  n,
  t,
  children,
  note,
  accent,
  last,
}: {
  n: string;
  t: string;
  children: React.ReactNode;
  note?: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-5 pb-8">
      {!last && (
        <span className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
      )}
      <div
        className={`z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display font-bold text-white ${
          accent ? "bg-accent" : "bg-primary"
        }`}
      >
        {n}
      </div>
      <div className="pt-1">
        <h3 className="font-display text-lg font-bold">{t}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{children}</p>
        {note && (
          <p className="mt-2.5 inline-flex rounded-md border border-accent/20 bg-accent/5 px-3.5 py-2.5 text-sm leading-snug text-text">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-border">
      <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-[15px] font-bold marker:content-['']">
        {q}
        <span className="text-2xl font-light text-primary transition group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="pb-5 text-sm leading-relaxed text-muted">{children}</p>
    </details>
  );
}
