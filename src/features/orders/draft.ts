/**
 * Order draft persisted in localStorage so a client can build a MULTI-product
 * order across taps: each shared SHEIN link (Android Share Target) appends to the
 * same draft instead of starting a new order. The draft survives navigation and
 * is cleared once the order is actually created (see ClearDraft, rendered on the
 * order page with ?nuevo=1).
 *
 * Client-only (localStorage); every access is guarded so SSR / private mode never
 * throws. Parsing is LENIENT on purpose: a draft holds in-progress items that
 * aren't valid yet (a link with no size/color), so we sanitize the shape rather
 * than schema-validate (which would reject them).
 */
import type { ItemInput } from "./schemas";
import { emptyItem } from "./schemas";

const DRAFT_KEY = "traelo_pedido_draft";

function normalize(x: unknown): ItemInput {
  const o = (x ?? {}) as Record<string, unknown>;
  const n = typeof o.cantidad === "number" ? Math.floor(o.cantidad) : 1;
  return {
    shein_url: typeof o.shein_url === "string" ? o.shein_url : "",
    talla: typeof o.talla === "string" ? o.talla : "",
    color: typeof o.color === "string" ? o.color : "",
    cantidad: Math.min(20, Math.max(1, n || 1)),
    notas_cliente: typeof o.notas_cliente === "string" ? o.notas_cliente : "",
  };
}

/** True when a row is an empty placeholder (safe to replace with a shared link). */
export function isItemEmpty(it: ItemInput): boolean {
  return (
    !it.shein_url.trim() &&
    !it.talla.trim() &&
    !it.color.trim() &&
    !it.notas_cliente.trim()
  );
}

export function loadDraft(): ItemInput[] {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

export function saveDraft(items: ItemInput[]): void {
  try {
    // Persist only once there's at least one real link; otherwise clear, so an
    // empty form never leaves a phantom draft behind.
    if (items.some((it) => it.shein_url.trim())) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  } catch {
    // localStorage unavailable (private mode) — the draft just won't persist.
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Merge a freshly shared link into a base item list: skip exact duplicates,
 * replace a lone empty placeholder, otherwise append. Pure (no I/O) so it's easy
 * to test. Returns the same array reference when nothing changes.
 */
export function appendSharedLink(base: ItemInput[], link: string): ItemInput[] {
  const url = link.trim();
  if (!url) return base;
  if (base.some((it) => it.shein_url.trim() === url)) return base; // dedupe
  if (base.length === 1 && isItemEmpty(base[0])) {
    return [{ ...emptyItem, shein_url: url }];
  }
  return [...base, { ...emptyItem, shein_url: url }];
}
