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
 * Admin pastes a SHEIN "Copy as cURL". We PARSE it (never exec — that input is
 * untrusted text) into a URL + headers, `fetch()` it from the server, and return
 * the best-effort extracted { nombre, precio, imagen } so the modal can pre-fill
 * the form. The admin reviews and saves via the `processItem` server action — so
 * this endpoint never writes to the DB. The curl URL is constrained to https
 * SHEIN hosts (SSRF guard in parseCurl).
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

  // Fetch SHEIN with a timeout; drop hop-by-hop headers curl injects.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let json: unknown;
  try {
    const headers = { ...req.headers };
    delete headers["Content-Length"];
    delete headers["content-length"];
    const res = await fetch(req.url, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `SHEIN respondió ${res.status}. El curl puede haber expirado.` },
        { status: 422 },
      );
    }
    json = await res.json();
  } catch {
    return NextResponse.json(
      { error: "No se pudo consultar SHEIN con ese curl (¿expiró o cambió?)." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }

  const extracted = extractSheinProduct(json);
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
