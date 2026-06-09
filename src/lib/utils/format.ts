/**
 * Display formatters. Locale fixed to es-CU style (Spanish, USD).
 * Pure functions — safe on server and client.
 */

/** $1,234.50 — money in USD, always 2 decimals. Returns "—" for null. */
export function formatUSD(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

/** "9 jun 2026" — short human date. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** "9 jun, 14:30" — date + time for activity timelines. */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "Hoy, 14:30" / "Ayer" / "7 jun 2026" — friendly relative date for lists. */
export function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, now)) {
    const hora = new Intl.DateTimeFormat("es", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
    return `Hoy, ${hora}`;
  }

  const ayer = new Date(now);
  ayer.setDate(now.getDate() - 1);
  if (sameDay(d, ayer)) return "Ayer";

  return formatDate(iso);
}
