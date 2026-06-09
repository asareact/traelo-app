/**
 * Derive product info from a SHEIN URL — no scraping, just parsing the SEO slug
 * (`/Some-Long-Title-p-468343500.html`). Used to adorn the order card with a
 * readable Spanish label BEFORE the admin processes the item. Once the admin
 * sets `producto_nombre`, that always wins.
 *
 * SHEIN titles are keyword-stuffed and in English, so we don't translate them
 * literally — we detect the garment type + a couple of attributes and compose a
 * short Spanish label (e.g. "Camiseta · oversize · manga corta").
 */

/** Garment type (checked in order — most specific first) → Spanish. */
const TIPOS: [RegExp, string][] = [
  [/\b(crop ?top)\b/i, "Top corto"],
  [/\b(tank ?top)\b/i, "Camiseta sin mangas"],
  [/\bt[ -]?shirt\b|\btee\b/i, "Camiseta"],
  [/\bblouse\b/i, "Blusa"],
  [/\bshirt\b/i, "Camisa"],
  [/\bbodysuit\b/i, "Body"],
  [/\btop\b/i, "Top"],
  [/\bmaxi ?dress\b/i, "Vestido largo"],
  [/\bdress\b/i, "Vestido"],
  [/\bjumpsuit\b/i, "Mono"],
  [/\bromper\b/i, "Mono corto"],
  [/\b(hoodie|sweatshirt)\b/i, "Sudadera"],
  [/\b(sweater|jumper|pullover)\b/i, "Suéter"],
  [/\bcardigan\b/i, "Cárdigan"],
  [/\bblazer\b/i, "Blazer"],
  [/\bjacket\b/i, "Chaqueta"],
  [/\bcoat\b/i, "Abrigo"],
  [/\bjeans\b/i, "Jeans"],
  [/\b(pants|trousers)\b/i, "Pantalón"],
  [/\bjoggers\b/i, "Joggers"],
  [/\bleggings\b/i, "Leggings"],
  [/\bshorts\b/i, "Short"],
  [/\bskirt\b/i, "Falda"],
  [/\b(swimsuit|bikini|bathing ?suit)\b/i, "Traje de baño"],
  [/\b(bra|bralette)\b/i, "Brasier"],
  [/\b(panties|underwear|briefs|lingerie)\b/i, "Ropa interior"],
  [/\b(sneakers|trainers)\b/i, "Tenis"],
  [/\bboots\b/i, "Botas"],
  [/\bsandals\b/i, "Sandalias"],
  [/\bheels\b/i, "Tacones"],
  [/\bshoes\b/i, "Zapatos"],
  [/\bbackpack\b/i, "Mochila"],
  [/\bbag\b/i, "Bolso"],
  [/\b(2 ?pcs?|set|two piece)\b/i, "Conjunto"],
];

/** Descriptive attributes (display priority order) → Spanish. */
const ATRIBUTOS: [RegExp, string][] = [
  [/\boversized?\b/i, "oversize"],
  [/\bcrop(ped)?\b/i, "crop"],
  [/\bshort ?sleeve\b/i, "manga corta"],
  [/\blong ?sleeve\b/i, "manga larga"],
  [/\bsleeveless\b/i, "sin mangas"],
  [/\b(slim|fitted) ?fit\b/i, "ajustado"],
  [/\bloose ?fit\b/i, "holgado"],
  [/\bbodycon\b/i, "ceñido"],
  [/\bhigh ?waist(ed)?\b/i, "tiro alto"],
  [/\bcotton\b/i, "algodón"],
  [/\bdenim\b/i, "denim"],
  [/\b(knit|jersey)\b/i, "de punto"],
  [/\bfloral\b/i, "floral"],
  [/\bstriped\b/i, "a rayas"],
  [/\bplaid\b/i, "a cuadros"],
  [/\blace\b/i, "de encaje"],
  [/\bvintage\b/i, "vintage"],
];

/** Extract the SEO slug (spaces) + product id from a SHEIN product URL. */
export function parseSheinSlug(
  url: string,
): { slug: string; id: string } | null {
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\/([^/]+?)-p-(\d+)\.html/i);
    if (!m) return null;
    return { slug: m[1].replace(/-/g, " ").trim(), id: m[2] };
  } catch {
    return null;
  }
}

/** Short Spanish-ish product label from a SHEIN URL, or null if not parseable. */
export function nombreProductoEs(url: string): string | null {
  const parsed = parseSheinSlug(url);
  if (!parsed) return null;
  const text = parsed.slug;

  const tipo = TIPOS.find(([re]) => re.test(text))?.[1];

  const attrs: string[] = [];
  for (const [re, es] of ATRIBUTOS) {
    if (re.test(text) && !attrs.includes(es)) attrs.push(es);
    if (attrs.length >= 2) break;
  }

  if (tipo) return [tipo, ...attrs].join(" · ");

  // No known type: clean, dedupe and shorten the slug as a fallback.
  const words = Array.from(
    new Set(text.toLowerCase().split(/\s+/).filter(Boolean)),
  ).slice(0, 5);
  if (!words.length) return null;
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

/** Audience tag (Hombre / Mujer / Unisex / Niños) from a SHEIN URL, or null. */
export function generoProductoEs(url: string): string | null {
  const hay = (re: RegExp) => re.test(url);
  if (hay(/\bunisex\b/i)) return "Unisex";
  if (hay(/\b(women|woman|girls?|ladies)\b/i)) return "Mujer";
  if (hay(/\b(men|man|boys?)\b/i)) return "Hombre";
  if (hay(/\b(kids|children|toddler|baby)\b/i)) return "Niños";
  return null;
}
