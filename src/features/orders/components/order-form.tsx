"use client";

import { useActionState, useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { IconPlus } from "@/components/brand/icons";
import { cn } from "@/lib/utils/cn";
import { createOrder, type CreateOrderState } from "@/features/orders/actions";
import { emptyItem, type ItemInput } from "@/features/orders/schemas";

/**
 * Multi-product order form. The client adds one row per SHEIN product (link +
 * size/color/qty/notes). On submit we serialize the rows to a hidden JSON
 * field; the server action re-validates and creates the order.
 */
export function OrderForm() {
  const [items, setItems] = useState<ItemInput[]>([{ ...emptyItem }]);
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

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="items_json" value={JSON.stringify(items)} />

      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface p-4"
        >
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
                required
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

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Enviando…" : "Enviar pedido"}
      </Button>

      <p className="text-center text-xs text-muted">
        Te confirmaremos el precio final antes de cualquier pago.
      </p>
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
