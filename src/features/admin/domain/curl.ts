/**
 * Curl parsing for the admin "Procesar item" flow — SECURITY CRITICAL.
 *
 * The admin copies a `curl …` command from SHEIN's product API (browser
 * DevTools → Copy as cURL) and pastes it in. We PARSE that string into a URL +
 * headers and issue a normal `fetch()` from the server. We NEVER hand it to a
 * shell (`exec`/`spawn`) — that would be a command-injection hole, since the
 * input is attacker-controllable text. This module is pure string parsing only.
 *
 * SSRF guard: the parsed URL must be https and point at a SHEIN host, so a
 * pasted curl can't be used to make the server hit internal/arbitrary targets.
 */

export interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

/** Hosts we'll allow the server to fetch. Keep narrow (SSRF guard). */
const SHEIN_HOST = /(^|\.)shein(corp)?\.(com|cn|us)$/i;

/**
 * Chrome/Edge DevTools "Copy as cURL (cmd)" (the Windows default) caret-escapes
 * specials — `^"`, `^&`, `^%^`, `^\^"` — and uses `^` + newline as the line
 * continuation. We unescape it into a normal bash-ish command before tokenizing.
 * Detected by the caret-escaped quote `^"` (the bash format never has it).
 */
function normalizeWindowsCurl(raw: string): string {
  if (!/\^"/.test(raw)) return raw;
  return raw.replace(/\^([\s\S])/g, (_, c: string) =>
    c === "\n" || c === "\r" ? " " : c,
  );
}

/**
 * Tokenize a shell-ish command respecting single/double quotes, `$'…'`,
 * backslash escapes and `\`-newline line continuations. No execution — this is
 * just splitting text into argv-like tokens the way a shell *would*, so we can
 * read curl's flags. Unknown/odd syntax degrades to best-effort tokens.
 */
function tokenize(input: string): string[] {
  // Drop backslash-newline line continuations first.
  const src = input.replace(/\\\r?\n/g, " ");
  const tokens: string[] = [];
  let i = 0;
  let cur = "";
  let has = false; // whether we're mid-token (so empty quotes still emit "")

  const push = () => {
    if (has) tokens.push(cur);
    cur = "";
    has = false;
  };

  while (i < src.length) {
    const ch = src[i];

    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      push();
      i++;
      continue;
    }

    // ANSI-C quoting $'...'
    if (ch === "$" && src[i + 1] === "'") {
      has = true;
      i += 2;
      while (i < src.length && src[i] !== "'") {
        if (src[i] === "\\" && i + 1 < src.length) {
          const n = src[i + 1];
          const map: Record<string, string> = {
            n: "\n",
            t: "\t",
            r: "\r",
            "\\": "\\",
            "'": "'",
            '"': '"',
          };
          cur += map[n] ?? n;
          i += 2;
        } else {
          cur += src[i++];
        }
      }
      i++; // closing '
      continue;
    }

    if (ch === "'") {
      has = true;
      i++;
      while (i < src.length && src[i] !== "'") cur += src[i++];
      i++; // closing '
      continue;
    }

    if (ch === '"') {
      has = true;
      i++;
      while (i < src.length && src[i] !== '"') {
        if (src[i] === "\\" && i + 1 < src.length) {
          const n = src[i + 1];
          // In double quotes, backslash only escapes a few chars.
          cur += '"\\$`'.includes(n) ? n : "\\" + n;
          i += 2;
        } else {
          cur += src[i++];
        }
      }
      i++; // closing "
      continue;
    }

    if (ch === "\\" && i + 1 < src.length) {
      has = true;
      cur += src[i + 1];
      i += 2;
      continue;
    }

    has = true;
    cur += ch;
    i++;
  }
  push();
  return tokens;
}

/** Read a flag's value, supporting both `-H x` and `-H=x` / `--header=x`. */
function flagValue(
  tokens: string[],
  index: number,
): { value: string; next: number } | null {
  const t = tokens[index];
  const eq = t.indexOf("=");
  if (eq > 0 && (t.startsWith("--") || /^-[A-Za-z]=/.test(t))) {
    return { value: t.slice(eq + 1), next: index + 1 };
  }
  const v = tokens[index + 1];
  if (v === undefined) return null;
  return { value: v, next: index + 2 };
}

/**
 * Parse a curl command into a fetchable request. Returns null if there's no
 * usable SHEIN https URL (so the caller can show a clear error).
 */
export function parseCurl(raw: string): ParsedCurl | null {
  const tokens = tokenize(normalizeWindowsCurl(raw.trim()));
  if (!tokens.length) return null;

  const headers: Record<string, string> = {};
  let url: string | null = null;
  let method: string | null = null;
  let body: string | null = null;

  // Skip a leading `curl` token if present.
  let i = tokens[0] === "curl" ? 1 : 0;

  for (; i < tokens.length; ) {
    const t = tokens[i];

    if (t === "-H" || t === "--header" || t.startsWith("--header=")) {
      const fv = flagValue(tokens, i);
      if (fv) {
        const c = fv.value.indexOf(":");
        if (c > 0) {
          const name = fv.value.slice(0, c).trim();
          const value = fv.value.slice(c + 1).trim();
          if (name) headers[name] = value;
        }
        i = fv.next;
        continue;
      }
    }

    if (
      t === "-X" ||
      t === "--request" ||
      t.startsWith("-X=") ||
      t.startsWith("--request=")
    ) {
      const fv = flagValue(tokens, i);
      if (fv) {
        method = fv.value.toUpperCase();
        i = fv.next;
        continue;
      }
    }

    if (
      t === "-d" ||
      t === "--data" ||
      t === "--data-raw" ||
      t === "--data-binary" ||
      t === "--data-urlencode" ||
      t.startsWith("--data")
    ) {
      const fv = flagValue(tokens, i);
      if (fv) {
        body = fv.value;
        i = fv.next;
        continue;
      }
    }

    // Flags that take a value we don't use — skip the value too.
    if (
      t === "-b" ||
      t === "--cookie" ||
      t === "-e" ||
      t === "--referer" ||
      t === "-A" ||
      t === "--user-agent" ||
      t === "--compressed-ssl"
    ) {
      const fv = flagValue(tokens, i);
      if (fv) {
        if (t === "-b" || t === "--cookie") headers["Cookie"] = fv.value;
        if (t === "-e" || t === "--referer") headers["Referer"] = fv.value;
        if (t === "-A" || t === "--user-agent")
          headers["User-Agent"] = fv.value;
        i = fv.next;
        continue;
      }
    }

    // A bare token that looks like a URL.
    if (!t.startsWith("-") && /^https?:\/\//i.test(t)) {
      url = t;
      i++;
      continue;
    }

    // `--url <value>`
    if (t === "--url" || t.startsWith("--url=")) {
      const fv = flagValue(tokens, i);
      if (fv) {
        url = fv.value;
        i = fv.next;
        continue;
      }
    }

    // Standalone boolean flags / anything else — skip one token.
    i++;
  }

  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  // SSRF guard: only https SHEIN hosts.
  if (parsed.protocol !== "https:") return null;
  if (!SHEIN_HOST.test(parsed.hostname)) return null;

  return {
    url: parsed.toString(),
    method: method ?? (body ? "POST" : "GET"),
    headers,
    body,
  };
}

/**
 * Best-effort extraction of product fields from SHEIN's JSON. The BFF response
 * shape varies, so instead of hardcoding one path we deep-scan for the first
 * plausible key. The admin always reviews the result before saving, so an
 * imperfect guess is fine — it just pre-fills the form.
 */
export interface ExtractedProduct {
  nombre: string | null;
  precio: number | null;
  imagen: string | null;
}

/** Read a number from a SHEIN price node ({ usdAmount, amount, amountWithSymbol } or a raw value). */
function pickAmount(v: unknown): number | null {
  if (typeof v === "number") return v > 0 ? v : null;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return pickAmount(o.usdAmount ?? o.amount ?? o.amountWithSymbol);
  }
  return null;
}

function cleanName(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function normImg(v: unknown): string | null {
  if (typeof v !== "string" || !v) return null;
  const u = v.trim();
  if (u.startsWith("//")) return "https:" + u;
  if (/^https?:\/\//i.test(u)) return u;
  return null;
}

/**
 * Price for the SIZE the customer ordered. SHEIN prices can vary per size, and
 * the headline price is a "from" (cheapest) value — using it could undercharge.
 * We scan the SKU list for a variant whose size attribute matches `talla` and
 * use that variant's sale price. Returns null if there's no match.
 */
function priceForSize(json: unknown, talla: string): number | null {
  const want = talla.trim().toLowerCase();
  if (!want) return null;
  let found: number | null = null;
  const seen = new Set<unknown>();
  const walk = (node: unknown) => {
    if (found !== null || !node || typeof node !== "object" || seen.has(node))
      return;
    seen.add(node);
    const o = node as Record<string, unknown>;
    if (Array.isArray(o.sku_sale_attr) && o.priceInfo) {
      const match = (o.sku_sale_attr as Record<string, unknown>[]).some((a) =>
        [a?.attr_value_name, a?.attr_value_name_en].some(
          (n) => typeof n === "string" && n.trim().toLowerCase() === want,
        ),
      );
      if (match) {
        const pi = o.priceInfo as Record<string, unknown>;
        found = pickAmount(pi.salePrice) ?? pickAmount(pi.retailPrice);
        return;
      }
    }
    for (const v of Object.values(o))
      if (v && typeof v === "object") walk(v);
  };
  walk(json);
  return found;
}

/** Guarded deep-scan fallback — strict keys only (no generic title/name/img). */
function deepScan(json: unknown): ExtractedProduct {
  const NAME = /^(goods_name|goods_title|product_name|productname|producttitle)$/i;
  const IMG =
    /^(goods_img|goods_image|goods_thumb|original_img|main_image|main_img)$/i;
  const SALE = /^sale_?price$/i;
  const RETAIL = /^retail_?price$/i;

  let nombre: string | null = null;
  let imagen: string | null = null;
  let sale: number | null = null;
  let retail: number | null = null;

  const seen = new Set<unknown>();
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    for (const [k, v] of Object.entries(node)) {
      if (nombre === null && NAME.test(k)) nombre = cleanName(v);
      if (imagen === null && IMG.test(k)) imagen = normImg(v);
      if (sale === null && SALE.test(k)) sale = pickAmount(v);
      if (retail === null && RETAIL.test(k)) retail = pickAmount(v);
      if (v && typeof v === "object") walk(v);
    }
  };
  walk(json);
  return { nombre, precio: sale ?? retail, imagen };
}

/**
 * Extract product fields from SHEIN's JSON. Targets the known shape first
 * (`info.priceInfo` / `info.productInfo`), then falls back to a guarded scan.
 *
 * Reality of the `get_goods_detail_realtime_data` endpoint: it carries PRICE
 * but NOT the product name or main image (those live in the static-detail
 * endpoint / page). So name usually comes back null here and the caller falls
 * back to the link-derived label; the image is filled by hand. Price, when a
 * `talla` is given, is matched to that exact size (SHEIN varies price by size).
 */
export function extractSheinProduct(
  json: unknown,
  opts?: { talla?: string | null },
): ExtractedProduct {
  const root =
    json && typeof json === "object" && "info" in (json as object)
      ? ((json as Record<string, unknown>).info as Record<string, unknown>)
      : (json as Record<string, unknown> | null);

  const priceInfo = root?.priceInfo as Record<string, unknown> | undefined;
  const productInfo = root?.productInfo as Record<string, unknown> | undefined;

  // Price: prefer the exact size the customer ordered, then the headline price.
  let precio =
    (opts?.talla ? priceForSize(json, opts.talla) : null) ??
    pickAmount(priceInfo?.salePrice) ??
    pickAmount(priceInfo?.retailPrice) ??
    null;

  let nombre =
    cleanName(productInfo?.goods_name) ?? cleanName(root?.goods_name) ?? null;

  let imagen =
    normImg(productInfo?.goods_img) ?? normImg(root?.goods_img) ?? null;

  // Fill any gaps via the guarded scan (still strict — no marketing titles).
  if (precio === null || nombre === null || imagen === null) {
    const scanned = deepScan(json);
    precio = precio ?? scanned.precio;
    nombre = nombre ?? scanned.nombre;
    imagen = imagen ?? scanned.imagen;
  }

  return { nombre, precio, imagen };
}
