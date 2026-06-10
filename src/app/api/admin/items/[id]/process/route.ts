import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  parseCurl,
  extractSheinProduct,
} from "@/features/admin/domain/curl";
import { extractCurlSchema } from "@/features/admin/schemas";

/**
 * POST /api/admin/items/[id]/process
 *
 * Admin pastes a SHEIN "Copy as cURL" of the product's realtime-data request. We
 * PARSE it (never exec — untrusted text) into a URL + headers, then make TWO
 * server fetches reusing its Cloudflare cookie (cf_clearance is domain-wide):
 *   - realtime-data  → live price, matched to the item's size
 *   - static-data    → product name + main image (derived URL, same params)
 * and return best-effort { nombre, precio, imagen } to pre-fill the modal. The
 * admin reviews and saves via the `processItem` action — this route never writes
 * to the DB. URLs are constrained to https SHEIN hosts (SSRF guard in parseCurl).
 *
 * Caveat: cf_clearance is short-lived, so a stale curl yields nulls and the UI
 * falls back to the link-derived name + manual entry. Paste a fresh curl per batch.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Item inválido." }, { status: 400 });
  }

  // Admin gate (the route is also behind the /admin-less /api path, so check here).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (profile?.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  // The item's size drives size-specific price extraction (SHEIN varies price
  // per size). Read it from the DB, not the client, as the trust boundary.
  const { data: item } = await supabase
    .from("pedido_items")
    .select("talla")
    .eq("id", id)
    .single();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const parsedBody = extractCurlSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const req = parseCurl(parsedBody.data.curl);
  if (!req) {
    return NextResponse.json(
      {
        error:
          "No se encontró una URL de SHEIN válida en el curl. Asegúrate de copiar 'Copy as cURL' desde la API de SHEIN.",
      },
      { status: 422 },
    );
  }

  // Headers from the curl (minus ones fetch must set itself). The cf_clearance
  // cookie in here is what passes SHEIN's Cloudflare — and it's domain-wide, so
  // we can reuse it for a second request.
  const headers = { ...req.headers };
  delete headers["Content-Length"];
  delete headers["content-length"];
  delete headers["Host"];
  delete headers["host"];

  const fetchJson = async (url: string): Promise<unknown | null> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  };

  // The pasted curl is the realtime endpoint (price, per size). The product NAME
  // and IMAGE live in the sibling `static_data` endpoint — same params, same
  // cookies — so we derive its URL and reuse the curl's cf_clearance to fetch it.
  const realtimeUrl = req.url;
  const staticUrl = realtimeUrl.replace(
    "get_goods_detail_realtime_data",
    "get_goods_detail_static_data",
  );

  const [realtimeJson, staticJson] = await Promise.all([
    fetchJson(realtimeUrl),
    staticUrl !== realtimeUrl ? fetchJson(staticUrl) : Promise.resolve(null),
  ]);

  if (!realtimeJson && !staticJson) {
    return NextResponse.json(
      {
        error:
          "No se pudo consultar SHEIN con ese curl (probablemente expiró — copia uno nuevo).",
      },
      { status: 502 },
    );
  }

  const talla = item?.talla ?? null;
  const fromRealtime = realtimeJson
    ? extractSheinProduct(realtimeJson, { talla })
    : { nombre: null, precio: null, imagen: null };
  const fromStatic = staticJson
    ? extractSheinProduct(staticJson, { talla })
    : { nombre: null, precio: null, imagen: null };

  // Name + image come best from static_data; price from realtime (live, by size).
  const extracted = {
    nombre: fromStatic.nombre ?? fromRealtime.nombre,
    precio: fromRealtime.precio ?? fromStatic.precio,
    imagen: fromStatic.imagen ?? fromRealtime.imagen,
  };

  if (!extracted.nombre && !extracted.precio && !extracted.imagen) {
    return NextResponse.json(
      {
        error:
          "Se consultó SHEIN pero no se pudo leer el producto. Llena los datos a mano.",
      },
      { status: 422 },
    );
  }

  return NextResponse.json(extracted);
}
