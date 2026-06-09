"use client";

import { useActionState, useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { IconPlus, IconWhatsapp } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";
import { whatsappLink, pedidoParaAdmin } from "@/lib/whatsapp";
import { createOrder, type CreateOrderState } from "@/features/orders/actions";
import {
  createOrderSchema,
  emptyItem,
  type ItemInput,
} from "@/features/orders/schemas";

/**
 * Multi-product order form. "Enviar pedido" validates and opens a confirmation
 * modal ("is this everything?"). Confirming IS the send: a single green action
 * that saves the order (for tracking) AND opens a prefilled WhatsApp chat to the
 * business with the full order — that's how the admin receives it. We mint the
 * order id client-side so the WhatsApp message can include the tracking link.
 */
export function OrderForm({
  whatsapp,
  nombre,
  telefono,
  siteUrl,
}: {
  whatsapp?: string | null;
  nombre?: string | null;
  telefono?: string | null;
  siteUrl?: string | null;
}) {
  const [items, setItems] = useState<ItemInput[]>([{ ...emptyItem }]);
  const [orderId, setOrderId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [localError, setLocalError] = useState("");
  const [state, formAction, pending] = useActionState<
    CreateOrderState,
    FormData
  >(createOrder, {});

  function update(i: number, patch: Partial<ItemInput>) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    );
  }
  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Validate, then mint the order id and open the confirmation modal.
  function review() {
    const parsed = createOrderSchema.safeParse({ items });
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message ?? "Revisa los productos.");
      return;
    }
    setLocalError("");
    setOrderId(crypto.randomUUID());
    setConfirmOpen(true);
  }

  const trackingUrl = orderId && siteUrl ? `${siteUrl}/pedidos/${orderId}` : null;
  const waHref =
    orderId && whatsapp
      ? whatsappLink(
          whatsapp,
          pedidoParaAdmin({
            idCorto: orderId.slice(0, 8),
            nombre,
            telefono,
            trackingUrl,
            items,
          }),
        )
      : null;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="items_json" value={JSON.stringify(items)} />
      <input type="hidden" name="id" value={orderId} />

      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">
              Producto {i + 1}
            </span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-xs font-bold text-error"
              >
                Quitar
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3.5">
            <Field label="Enlace del producto (SHEIN)">
              <Input
                type="url"
                inputMode="url"
                placeholder="https://us.shein.com/..."
                value={item.shein_url}
                onChange={(e) => update(i, { shein_url: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Talla">
                <Input
                  placeholder="M, 38, única…"
                  value={item.talla}
                  onChange={(e) => update(i, { talla: e.target.value })}
                />
              </Field>
              <Field label="Color">
                <Input
                  placeholder="Negro, rojo…"
                  value={item.color}
                  onChange={(e) => update(i, { color: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Cantidad">
              <Stepper
                value={item.cantidad}
                onChange={(v) => update(i, { cantidad: v })}
              />
            </Field>

            <Field label="Notas (opcional)">
              <Textarea
                placeholder="Algún detalle que debamos saber…"
                value={item.notas_cliente}
                onChange={(e) => update(i, { notas_cliente: e.target.value })}
              />
            </Field>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={addItem}
        className="w-full border-dashed"
      >
        <IconPlus size={18} />
        Agregar otro producto
      </Button>

      {localError && <Alert tone="error">{localError}</Alert>}

      <Button type="button" size="lg" onClick={review} className="w-full">
        Enviar pedido
      </Button>

      <p className="text-center text-xs text-muted">
        Te confirmaremos el precio final antes de cualquier pago.
      </p>

      {/* Confirmation modal — confirming sends the order via WhatsApp */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h2 className="font-display text-xl font-bold text-text">
          ¿Esto es todo?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Revisa que agregaste{" "}
          <span className="font-bold text-text">todos los productos</span> que
          quieres traer.{" "}
          {waHref
            ? "Al enviar te abrimos WhatsApp con tu pedido para que nos llegue."
            : "Lo revisamos y te confirmamos el precio antes de pagar."}
        </p>

        {state.error && (
          <Alert tone="error" className="mt-4">
            {state.error}
          </Alert>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            onClick={() => {
              if (waHref) window.open(waHref, "_blank", "noopener,noreferrer");
            }}
            className={cn(
              "w-full",
              waHref &&
                "bg-[#25D366] text-white hover:bg-[#25D366] hover:opacity-90",
            )}
          >
            {waHref && <IconWhatsapp size={20} />}
            {pending
              ? "Enviando…"
              : waHref
                ? "Enviar por WhatsApp"
                : "Sí, enviar pedido"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirmOpen(false)}
            className="w-full"
            disabled={pending}
          >
            Seguir agregando
          </Button>
        </div>
      </Modal>
    </form>
  );
}

function Stepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-md border-[1.5px] border-border bg-bg text-lg font-bold text-text transition active:scale-95 disabled:opacity-40";
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Menos"
      >
        −
      </button>
      <span className="w-8 text-center text-[15px] font-bold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className={cn(btn)}
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={value >= 20}
        aria-label="Más"
      >
        +
      </button>
    </div>
  );
}
