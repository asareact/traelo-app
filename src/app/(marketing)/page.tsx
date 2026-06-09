import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/motion/reveal";
import {
  IconLink,
  IconShield,
  IconWallet,
  IconTruck,
  IconScale,
  IconShirt,
  IconShoe,
  IconSparkle,
  IconBag,
  IconHome,
  IconBox,
  IconWhatsapp,
} from "@/components/brand/icons";

// Subtle film grain overlay (premium tactile texture).
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#1c1714]/90 px-6 py-4 backdrop-blur-md">
        <Logo variant="light" size={32} />
        <div className="hidden items-center gap-7 text-sm font-semibold text-[#9b8e84] md:flex">
          <a href="#como-funciona" className="transition hover:text-[#f0ebe0]">
            ¿Cómo funciona?
          </a>
          <a href="#precios" className="transition hover:text-[#f0ebe0]">
            Precios
          </a>
          <a href="#tiempos" className="transition hover:text-[#f0ebe0]">
            Tiempos
          </a>
          <a href="#faq" className="transition hover:text-[#f0ebe0]">
            FAQ
          </a>
        </div>
        <Link
          href={pedidoHref}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:opacity-90"
        >
          Hacer un pedido
        </Link>
      </nav>

      {/* ─── 1. HERO ─── */}
      <section className="relative overflow-hidden text-[#f0ebe0]">
        {/* base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(155deg, #2A1A12 0%, #1C1714 45%, #081410 100%)",
          }}
        />
        {/* terracotta glow */}
        <div
          className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full opacity-50 blur-[120px]"
          style={{ background: "radial-gradient(circle, #C4522A, transparent 65%)" }}
        />
        {/* teal glow */}
        <div
          className="absolute -bottom-40 right-0 h-[32rem] w-[32rem] rounded-full opacity-25 blur-[120px]"
          style={{ background: "radial-gradient(circle, #00B5A0, transparent 65%)" }}
        />
        {/* grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />

        <div className="relative mx-auto grid min-h-[90svh] max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          {/* Left: copy */}
          <div>
            <span className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold text-accent backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              247 pedidos entregados exitosamente
            </span>
            <h1 className="font-display text-6xl font-extrabold leading-[0.98] tracking-tight sm:text-7xl xl:text-[5.5rem]">
              Tu pedido de
              <br />
              SHEIN llega a{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, #E2683C, #C4522A)",
                }}
              >
                Cuba.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#b3a79d] sm:text-lg">
              Pega el link del producto que quieres. Nosotros lo compramos, lo
              enviamos, y tú ves cada paso en tiempo real. Sin transferencias a
              ciegas, sin semanas de silencio.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={pedidoHref}
                className="rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 transition hover:-translate-y-0.5 hover:opacity-95"
              >
                Hacer mi pedido →
              </Link>
              <a
                href="#como-funciona"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-[#f0ebe0] backdrop-blur transition hover:bg-white/10"
              >
                ¿Cómo funciona?
              </a>
            </div>
            <div className="mt-14 flex flex-wrap gap-x-8 gap-y-5">
              <Stat n="$7" l="USD por libra" />
              <Divider />
              <Stat n="22-35" l="días promedio" />
              <Divider />
              <Stat n="98%" l="entregados" />
              <Divider />
              <Stat n="5-7d" l="express 10+ lbs" />
            </div>
          </div>

          {/* Right: floating tracking card showcase */}
          <div className="hidden lg:block">
            <HeroTrackingCard />
          </div>
        </div>
      </section>

      {/* ─── 2. CÓMO FUNCIONA ─── */}
      <section id="como-funciona" className="bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Label>Proceso</Label>
            <Title>5 pasos. Sin complicaciones.</Title>
            <Sub>
              Desde que pegas el link hasta que recibes el paquete, todo queda
              registrado y visible para ti.
            </Sub>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { i: <IconLink />, t: "Pega el link de SHEIN", d: "Copia el link, elige talla, color y cantidad. Varios productos en un pedido." },
              { i: <IconShield />, t: "Recibe el precio real", d: "El admin verifica en SHEIN en menos de 24 h y te lo envía con evidencia." },
              { i: <IconWallet />, t: "Pagas y compramos", d: "Confirmas el precio, pagas, y compramos en SHEIN guardando el comprobante." },
              { i: <IconTruck />, t: "Sigue tu pedido en vivo", d: "EE.UU. → empaque → Cuba. Cada estado en tu link de tracking.", a: true },
              { i: <IconScale />, t: "Recoges y pagas las libras", d: "Te avisamos el peso con foto por adelantado. Al recoger ya sabes cuánto pesó y pagas las libras.", a: true },
            ].map((s, idx) => (
              <Reveal key={s.t} delay={idx * 80}>
                <Step n={idx + 1} icon={s.i} t={s.t} accent={s.a}>
                  {s.d}
                </Step>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. POR QUÉ TRAELO ─── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <Label>Diferencia</Label>
            <Title>¿Por qué Traelo y no el revendedor de Facebook?</Title>
            <Sub>La experiencia que mereces cuando confías tu dinero a alguien.</Sub>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-border bg-white/40 p-8">
                <h3 className="mb-6 font-display text-lg font-bold text-muted">
                  El revendedor de Facebook
                </h3>
                {[
                  "Mandas screenshots por WhatsApp y esperas respuesta",
                  "El precio cambia sin aviso previo",
                  "Transferencia a ciegas sin comprobante",
                  "No sabes dónde está tu pedido",
                  "Si hay problema, no tienes nada por escrito",
                  "Peso del paquete no verificable",
                ].map((t) => (
                  <Row key={t} bad>
                    {t}
                  </Row>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div
                className="h-full rounded-2xl border border-accent/25 p-8 shadow-xl shadow-accent/5"
                style={{ background: "linear-gradient(160deg, rgba(0,181,160,0.08), rgba(0,181,160,0.02))" }}
              >
                <h3 className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-accent">
                  <IconShield size={20} /> Traelo
                </h3>
                {[
                  "Formulario estructurado, sin va-y-ven de mensajes",
                  "Precio confirmado con captura real de SHEIN",
                  "Comprobante del pago guardado en tu pedido",
                  "Link de tracking actualizado en cada paso",
                  "Todo registrado: artículos, precios, pagos",
                  "Foto del peso real del paquete como evidencia",
                ].map((t) => (
                  <Row key={t}>{t}</Row>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 4. CATEGORÍAS ─── */}
      <section className="bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Label>Productos</Label>
            <Title>¿Qué puedes pedir?</Title>
            <Sub>
              Todo lo que vende SHEIN. El peso estimado determina el costo de
              envío por libra.
            </Sub>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { i: <IconShirt size={22} />, n: "Ropa", p: "~0.3 lbs por pieza" },
              { i: <IconShoe size={22} />, n: "Calzado", p: "~0.8 lbs por par" },
              { i: <IconSparkle size={22} />, n: "Belleza", p: "~0.4 lbs por item" },
              { i: <IconBag size={22} />, n: "Accesorios", p: "~0.2 lbs por item" },
              { i: <IconHome size={22} />, n: "Hogar", p: "Variable según item" },
            ].map((c, idx) => (
              <Reveal key={c.n} delay={idx * 60}>
                <Cat icon={c.i} name={c.n} peso={c.p} />
              </Reveal>
            ))}
            <Reveal delay={300}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-accent/40 bg-accent/5 p-6 transition hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <IconBox size={22} />
                </span>
                <span className="font-display text-lg font-bold">
                  Pedido +10 lbs
                </span>
                <span className="text-xs text-muted">Descuento automático</span>
                <span className="mt-auto text-sm font-bold text-accent">
                  Express disponible
                  <span className="block font-normal text-muted">
                    5-7 días a Cuba
                  </span>
                </span>
              </div>
            </Reveal>
          </div>
          <p className="mt-6 text-sm text-muted">
            El peso real se confirma cuando tu pedido llega a EE.UU., con foto
            como evidencia. Puedes verificarlo en persona al recoger.
          </p>
        </div>
      </section>

      {/* ─── 5. PRECIOS ─── */}
      <section
        id="precios"
        className="relative overflow-hidden px-6 py-24 text-[#f0ebe0]"
      >
        <div className="absolute inset-0 bg-text" />
        <div
          className="absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 opacity-30 blur-[120px]"
          style={{ background: "radial-gradient(circle, #C4522A, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Tarifas
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Precios claros, sin sorpresas.
            </h2>
            <p className="mt-3 max-w-xl text-base text-[#9b8e84]">
              El precio del envío se calcula por el peso real del paquete. Lo
              mínimo es 1 libra. Siempre con evidencia fotográfica.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8c7f76]">
                  Envío estándar
                </p>
                <div className="font-display text-5xl font-extrabold">
                  $7
                  <span className="text-lg font-normal text-[#8c7f76]">
                    {" "}
                    / libra
                  </span>
                </div>
                <p className="mb-6 mt-1 text-sm text-[#8c7f76]">mínimo 1 lb</p>
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
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full rounded-2xl bg-primary p-8 shadow-2xl shadow-primary/30">
                <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                  Express · 10+ lbs
                </p>
                <div className="font-display text-5xl font-extrabold">
                  $7
                  <span className="text-lg font-normal text-white/70">
                    {" "}
                    / libra
                  </span>
                </div>
                <p className="mb-6 mt-1 text-sm text-white/70">
                  + servicio express (según peso)
                </p>
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
            </Reveal>
          </div>
          <p className="mt-8 text-xs leading-relaxed text-[#6b6460]">
            Los tiempos son estimados pesimistas; en la práctica suelen ser
            menores. Las libras se pagan al recoger el pedido (ya conoces el
            peso de antemano), nunca por adelantado.
          </p>
        </div>
      </section>

      {/* ─── 6. TIEMPOS ─── */}
      <section id="tiempos" className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <Label>Tiempos de entrega</Label>
            <Title>¿Cuándo llega tu pedido?</Title>
            <Sub>
              Tiempos estimados pesimistas. Lo habitual es que lleguen antes.
              Depende de la época del año y el tamaño del envío.
            </Sub>
          </Reveal>
          <Reveal>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border shadow-sm">
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
                    tramo="SHEIN → EE.UU."
                    desc="Lo que tarda SHEIN en enviar tu pedido a EE.UU."
                    std="15-20 días"
                    exp="15-20 días"
                    expTag="No cambia"
                  />
                  <TiempoRow
                    tramo="EE.UU. → Cuba"
                    desc="Desde que tenemos tu pedido en EE.UU. hasta Cuba"
                    std="7-15 días"
                    exp="5-7 días"
                    expTag="Express"
                  />
                  <tr className="bg-surface/50">
                    <td className="p-4 align-top">
                      <div className="font-bold text-primary">
                        Total estimado
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        Desde que pagas hasta que lo tienes
                      </div>
                    </td>
                    <td className="p-4 align-top font-display text-xl font-bold">
                      22-35 días
                    </td>
                    <td className="p-4 align-top font-display text-xl font-bold text-accent">
                      20-27 días
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
          <p className="mt-4 text-sm text-muted">
            El express solo acelera el tramo de EE.UU. a Cuba, una vez que ya
            tenemos tu pedido. No cambia el tiempo de SHEIN. En temporada alta
            (noviembre-enero) pueden ser 5-7 días más.
          </p>
        </div>
      </section>

      {/* ─── 7. CÓMO PAGO ─── */}
      <section id="como-pago" className="bg-surface px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Label>Pagos</Label>
            <Title>¿Cómo se paga?</Title>
            <Sub>
              Dos momentos de pago. Todo por canales acordados por WhatsApp, sin
              plataformas intermediarias.
            </Sub>
          </Reveal>
          <div className="mt-12">
            <Reveal>
              <Pago n="1" t="Haces el pedido — queda reservado">
                Tu pedido se registra con todos los artículos, tallas y colores.
                El admin verifica los precios reales en SHEIN y te los envía en
                menos de 24 horas.
              </Pago>
            </Reveal>
            <Reveal>
              <Pago
                n="2"
                t="Pago de los artículos SHEIN"
                note="Guardamos el comprobante del pago en SHEIN y los links reales de cada artículo para que los consultes cuando quieras."
              >
                Cuando aceptas el precio confirmado, pagas el total de los
                artículos en persona: en CUP efectivo (al cambio del Toque),
                USD o MLC. El pedido queda en espera hasta confirmar el pago.
              </Pago>
            </Reveal>
            <Reveal>
              <Pago
                n="3"
                t="Te avisamos el peso por adelantado"
                accent
                note="Artículos menores a 1 lb se cobran como 1 lb. Pedidos de más de 10 lbs tienen descuento automático."
              >
                Cuando tu pedido llega a EE.UU., lo pesamos y te enviamos la
                foto del peso como evidencia. Así sabes exactamente cuánto pesó
                antes de recogerlo.
              </Pago>
            </Reveal>
            <Reveal>
              <Pago n="4" t="Recoges y pagas las libras" accent last>
                Al recoger tu pedido pagas las libras según el peso que ya te
                avisamos ($7 USD/lb). Puedes verificar el peso en persona en ese
                momento.
              </Pago>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 8. FAQ ─── */}
      <section id="faq" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Label>Preguntas frecuentes</Label>
            <Title>Lo que todos preguntan</Title>
          </Reveal>
          <Reveal>
            <div className="mt-8 border-t border-border">
              <Faq q="¿Puedo pedir cualquier cosa de SHEIN?">
                Sí, cualquier artículo: ropa, calzado, accesorios, belleza,
                hogar. Pega el link directamente desde SHEIN. Si dudas sobre un
                artículo, escríbenos por WhatsApp antes de pedirlo.
              </Faq>
              <Faq q="¿Cómo sé que el precio es el real?">
                El admin verifica el precio directamente en SHEIN y te envía una{" "}
                <strong className="text-text">captura como evidencia</strong>{" "}
                antes de que pagues. Solo cuando aceptas ese precio se procede al
                cobro.
              </Faq>
              <Faq q="¿Cuándo y cómo sé cuánto pesó mi pedido?">
                Cuando tu pedido llega a EE.UU. lo pesamos y te enviamos{" "}
                <strong className="text-text">foto del peso</strong> por
                adelantado. Así, cuando vayas a recoger tu pedido, ya sabes
                exactamente cuánto pesó y cuánto vas a pagar por las libras.
                Puedes verificar el peso en persona al recoger.
              </Faq>
              <Faq q="¿Qué pasa con las aduanas cubanas?">
                Los envíos se manejan por canales con experiencia en envíos a
                Cuba. Los artículos de uso personal generalmente no tienen
                problemas. Artículos electrónicos o de alto valor pueden tener
                restricciones, consulta antes.
              </Faq>
              <Faq q="¿Puedo ver los artículos que pedí después?">
                Sí. Cada artículo guarda el{" "}
                <strong className="text-text">link real a SHEIN</strong> para que
                lo veas cuando quieras. Si el link expira, tienes la captura
                guardada.
              </Faq>
              <Faq q="¿Puedo cancelar un pedido?">
                Puedes cancelar sin costo mientras esté en cotización o revisión
                (antes de pagar). Una vez pagado y comprado en SHEIN no es
                posible, porque SHEIN no acepta devoluciones en envíos
                internacionales.
              </Faq>
              <Faq q="¿Cuándo está disponible el envío express?">
                El express a Cuba (5-7 días) está disponible para{" "}
                <strong className="text-text">pedidos de 10 libras o más</strong>.
                Se ofrece automáticamente al confirmar el envío.
              </Faq>
              <Faq q="¿Y si llega dañado o con artículos incorrectos?">
                Guardamos evidencia fotográfica del contenido al recibirlo en
                EE.UU. Si hay algo incorrecto o dañado, lo notificamos antes del
                envío a Cuba y tenemos la documentación para resolver.
              </Faq>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 9. CTA FINAL ─── */}
      <section
        id="contacto"
        className="relative overflow-hidden px-6 py-24 text-center text-[#f0ebe0]"
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #2A1A12, #1C1714)" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-80 w-[36rem] -translate-x-1/2 -translate-y-1/2 opacity-40 blur-[120px]"
          style={{ background: "radial-gradient(circle, #C4522A, transparent 70%)" }}
        />
        <Reveal className="relative mx-auto max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Empieza hoy
          </p>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            ¿Listo para hacer tu pedido?
          </h2>
          <p className="mx-auto mb-10 mt-4 max-w-md text-base text-[#9b8e84]">
            Pega el link de SHEIN, elige tu talla, y nosotros hacemos el resto.
            Precio confirmado en menos de 24 horas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={pedidoHref}
              className="rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 transition hover:-translate-y-0.5"
            >
              Hacer mi pedido →
            </Link>
            <a
              href={waHref}
              className="inline-flex items-center gap-2 rounded-full border px-8 py-4 text-base font-bold transition hover:bg-white/5"
              style={{ borderColor: "rgba(37,211,102,0.5)", color: "#25D366" }}
            >
              <IconWhatsapp size={20} /> Preguntar por WhatsApp
            </a>
          </div>
        </Reveal>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-text px-6 py-12 text-[#6b6460]">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <Logo variant="light" size={28} />
              <p className="mt-3 max-w-xs text-sm">
                Pedidos de SHEIN a Cuba con transparencia real.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <a
                href={waHref}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
                style={{ background: "#25D366" }}
              >
                <IconWhatsapp size={18} /> WhatsApp
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
          <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-6 text-xs">
            <span>© 2026 Traelo. Todos los derechos reservados.</span>
            <span>traelo.app</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── helpers ─────────── */

function HeroTrackingCard() {
  return (
    <div className="relative mx-auto max-w-sm">
      {/* glow behind card */}
      <div
        className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
        style={{ background: "linear-gradient(135deg, #C4522A, #00B5A0)" }}
      />
      <div className="relative rounded-2xl border border-white/10 bg-[#241c17]/80 p-1 shadow-2xl backdrop-blur">
        {/* header */}
        <div className="rounded-t-xl bg-primary px-5 py-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
            Pedido #TRL-2026-0034 · María G.
          </p>
          <p className="mt-1 font-display text-lg font-bold">
            En camino a Cuba ✈
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-[68%] rounded-full bg-white" />
          </div>
        </div>
        {/* timeline */}
        <div className="space-y-3 px-5 py-5">
          {[
            { t: "Precio confirmado", d: "$47.80 USD", done: true },
            { t: "Pago recibido", d: "3 jun", done: true },
            { t: "Comprado en SHEIN", d: "5 jun", done: true },
            { t: "Enviado a Cuba", d: "Ahora", cur: true },
            { t: "Entregado", d: "Pendiente", done: false },
          ].map((s) => (
            <div key={s.t} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  s.cur
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : s.done
                      ? "bg-accent text-white"
                      : "bg-white/10 text-transparent"
                }`}
              >
                {s.done ? "✓" : s.cur ? "→" : "•"}
              </span>
              <div className="flex flex-1 justify-between">
                <span
                  className={`text-sm font-semibold ${
                    s.cur
                      ? "text-primary"
                      : s.done
                        ? "text-[#f0ebe0]"
                        : "text-[#6b6460]"
                  }`}
                >
                  {s.t}
                </span>
                <span className="text-xs text-[#8c7f76]">{s.d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold text-[#f0ebe0]">{n}</div>
      <div className="mt-1 text-xs text-[#8c7f76]">{l}</div>
    </div>
  );
}

function Divider() {
  return <span className="hidden h-10 w-px self-center bg-white/10 sm:block" />;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
      {children}
    </p>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-[2.6rem]">
      {children}
    </h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-xl text-base text-muted">{children}</p>;
}

function Step({
  n,
  icon,
  t,
  accent,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  t: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full rounded-2xl border border-border bg-white/50 p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            accent ? "bg-accent/12 text-accent" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </span>
        <span className="font-display text-2xl font-bold text-border">{n}</span>
      </div>
      <h3 className="mt-4 font-display text-base font-bold">{t}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}

function Row({ children, bad }: { children: React.ReactNode; bad?: boolean }) {
  return (
    <p className="mb-3.5 flex gap-2.5 text-sm leading-snug">
      <span
        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          bad ? "bg-muted/20 text-muted" : "bg-accent/15 text-accent"
        }`}
      >
        {bad ? "✕" : "✓"}
      </span>
      <span className={bad ? "text-muted" : ""}>{children}</span>
    </p>
  );
}

function Cat({
  icon,
  name,
  peso,
}: {
  icon: React.ReactNode;
  name: string;
  peso: string;
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-white/50 p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="font-display text-lg font-bold">{name}</span>
      <span className="text-xs text-muted">{peso}</span>
      <span className="mt-auto text-sm font-bold text-primary">
        $7.00{" "}
        <span className="font-normal text-muted">por libra · mín. 1 lb</span>
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
      className={`mb-2.5 flex gap-2.5 text-sm ${
        onPrimary ? "text-white/90" : "text-[#cfc7bd]"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] ${
          onPrimary ? "bg-white/20 text-white" : "bg-accent/20 text-accent"
        }`}
      >
        ✓
      </span>
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
    <div className="relative flex gap-5 pb-9">
      {!last && (
        <span className="absolute bottom-0 left-5 top-11 w-0.5 bg-border" />
      )}
      <div
        className={`z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display font-bold text-white shadow-lg ${
          accent ? "bg-accent shadow-accent/25" : "bg-primary shadow-primary/25"
        }`}
      >
        {n}
      </div>
      <div className="pt-1">
        <h3 className="font-display text-lg font-bold">{t}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{children}</p>
        {note && (
          <p className="mt-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm leading-snug text-text">
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
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-bold transition group-hover:text-primary">
        {q}
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface text-xl font-light text-primary transition group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="pb-5 text-sm leading-relaxed text-muted">{children}</p>
    </details>
  );
}
