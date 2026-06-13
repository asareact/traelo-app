"use client";

import { useEffect } from "react";
import { clearDraft } from "@/features/orders/draft";

/**
 * Clears the saved order draft once an order has been created. Rendered on the
 * order page only when ?nuevo=1 (the redirect target of a successful create), so
 * the next "Nuevo pedido" starts fresh instead of showing the items just sent.
 * Renders nothing.
 */
export function ClearDraft() {
  useEffect(() => {
    clearDraft();
  }, []);
  return null;
}
