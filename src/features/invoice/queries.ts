import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { business } from "@/config/business";
import type { Estado } from "@/features/orders/domain/estados";
import type { TipoEnvio } from "@/features/orders/domain/pricing";
import type { Pedido, PedidoItem, Profile } from "@/types/database";
import {
  numeroFactura,
  lineasFactura,
  desgloseFactura,
  permiteFactura,
  type FacturaData,
} from "./domain/factura";

const DEFAULT_RECARGO_EXPRESS = 2.65;

/** True when the logged-in user is an admin (RLS also enforces this). */
async function isCallerAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  return data?.rol === "admin";
}

/**
 * Sniff the real image format from magic bytes. We can NOT trust the CDN's
 * Content-Type: SHEIN serves JPEG bytes from a `.png` URL with
 * `Content-Type: image/png`. Trusting that header builds a `data:image/png`
 * with JPEG bytes, which @react-pdf can't decode ("Incomplete or corrupt PNG")
 * → blank thumbnail. Returns the true mime, or null for formats react-pdf
 * can't render (webp/gif/etc. → caller draws a placeholder).
 */
function sniffImageMime(b: Buffer): string | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47
  )
    return "image/png";
  return null; // webp, gif, unknown — not decodable by @react-pdf
}

/**
 * Fetch a product thumbnail and inline it as a data URI so the PDF is
 * self-contained and a broken/slow CDN link can never fail the whole render.
 * The mime is detected from the bytes (not the lying Content-Type). Best-effort:
 * any error or unsupported format → null (the document draws a placeholder).
 */
async function embebeImagen(url: string | null): Promise<string | null> {
  if (!url) return null;
  // Bound the CDN fetch: a slow/hanging SHEIN image must NOT hang the whole PDF
  // request (on Vercel that burns the function's max duration → admin stares at a
  // spinner forever). On timeout/abort we fall through to the placeholder.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!res.ok) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    const mime = sniffImageMime(bytes);
    if (!mime) return null;
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Split a free-text address into display lines (commas → line breaks). */
function direccionEnLineas(dir: string | null): string[] {
  if (!dir) return [];
  return dir
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Assemble everything the invoice PDF needs for one order. Admin-only, and only
 * once the order is PAGADO or beyond. Returns null when not allowed or the order
 * doesn't exist — the route turns that into a 403/404.
 *
 * Uses the admin client (service_role) AFTER verifying the caller is an admin:
 * it needs the client's email from auth.users, which RLS doesn't expose.
 */
export async function getFacturaData(
  pedidoId: string,
): Promise<FacturaData | null> {
  if (!(await isCallerAdmin())) return null;
  return buildFacturaData(pedidoId);
}

/**
 * Assemble the invoice data WITHOUT the auth check. Split out so `getFacturaData`
 * stays the only authenticated entry point while the assembly logic is unit-
 * testable on its own. Do NOT expose this through an unauthenticated route.
 */
export async function buildFacturaData(
  pedidoId: string,
): Promise<FacturaData | null> {
  const admin = createAdminClient();

  const { data: pedidoRow } = await admin
    .from("pedidos")
    .select("*, pedido_items(*)")
    .eq("id", pedidoId)
    .single();
  if (!pedidoRow) return null;

  const pedido = pedidoRow as Pedido & { pedido_items: PedidoItem[] };
  if (!permiteFactura(pedido.estado_actual as Estado)) return null;

  const items = [...(pedido.pedido_items ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );

  // Client profile + email (email lives in auth.users, not profiles).
  const { data: perfil } = await admin
    .from("profiles")
    .select("nombre, telefono, direccion")
    .eq("id", pedido.user_id)
    .single();
  const cliente = (perfil ?? null) as Pick<
    Profile,
    "nombre" | "telefono" | "direccion"
  > | null;
  const { data: authUser } = await admin.auth.admin.getUserById(pedido.user_id);
  const emailCliente = authUser?.user?.email ?? null;

  // Config: express surcharge rate (for the breakdown) + the business phone
  // shown as the issuer contact.
  const { data: cfgRows } = await admin
    .from("config")
    .select("key, value")
    .in("key", ["recargo_express_por_lb", "whatsapp_phone"]);
  const cfg = Object.fromEntries(
    (cfgRows ?? []).map((r) => [r.key, r.value]),
  ) as Record<string, string>;
  const recargoPorLb = (() => {
    const n = Number(cfg.recargo_express_por_lb);
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_RECARGO_EXPRESS;
  })();
  const telefonoEmisor = cfg.whatsapp_phone || null;

  const tipoEnvio = (pedido.tipo_envio ?? "estandar") as TipoEnvio;

  // Inline thumbnails (concurrently) so the PDF carries its own images.
  const lineas = lineasFactura(items);
  const imagenes = await Promise.all(lineas.map((l) => embebeImagen(l.imagen)));
  const lineasConImg = lineas.map((l, i) => ({ ...l, imagen: imagenes[i] }));

  const numero = numeroFactura(pedido.id, pedido.created_at);

  // Structured trace: if an admin reports the invoice won't generate, this line
  // reconstructs what happened (which order, how many thumbnails embedded vs the
  // CDN dropped). Lands in the server logs.
  console.log(
    JSON.stringify({
      evt: "factura.generada",
      pedido: pedido.id,
      numero,
      estado: pedido.estado_actual,
      items: lineas.length,
      imagenesOk: imagenes.filter(Boolean).length,
      imagenesTotal: imagenes.length,
    }),
  );

  return {
    numero,
    fechaIso: pedido.created_at,
    emisor: {
      nombre: business.nombre,
      email: null,
      telefono: telefonoEmisor,
      direccion: [business.eslogan, business.ubicacion],
    },
    cliente: {
      nombre: cliente?.nombre?.trim() || "Cliente",
      email: emailCliente,
      telefono: cliente?.telefono ?? null,
      direccion: direccionEnLineas(cliente?.direccion ?? null),
    },
    lineas: lineasConImg,
    desglose: desgloseFactura(
      items,
      pedido.total_real_usd,
      pedido.peso_lb,
      tipoEnvio,
      recargoPorLb,
    ),
    tipoEnvio,
    pesoLb: pedido.peso_lb,
  };
}
