import type { Profile } from "@/types/database";

/**
 * A profile is "complete" enough to place an order when it has a name and a
 * phone. Address is optional; role is irrelevant to the client flow.
 * Pure function — the single source of truth for the order gate.
 */
export function isProfileComplete(
  p: Pick<Profile, "nombre" | "telefono"> | null | undefined,
): boolean {
  return Boolean(p?.nombre?.trim() && p?.telefono?.trim());
}

/** Path the order flow sends incomplete profiles to (with a return target). */
export function completarPerfilHref(next: string): string {
  return `/perfil/completar?next=${encodeURIComponent(next)}`;
}
