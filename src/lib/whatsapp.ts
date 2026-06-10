/**
 * WhatsApp infra helper — builds a wa.me deep link. Message TEMPLATES live in
 * `features/orders/domain/notificaciones` (business copy belongs in the domain,
 * not in lib/). This file stays logic-free per the architecture rules.
 */

/**
 * Build a wa.me link. `phone` may include `+`, spaces or dashes — we strip to
 * digits. Returns null when there's no usable number (e.g. config still holds
 * the placeholder), so callers can hide the button.
 */
export function whatsappLink(
  phone: string | null | undefined,
  message: string,
): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
