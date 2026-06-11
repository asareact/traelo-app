"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { updateConfig, type AdminActionState } from "@/features/admin/actions";

/**
 * Edit the business config (config table). Pre-filled from the current values;
 * saving upserts the three keys via the admin-gated `updateConfig` action.
 */
export function ConfigForm({
  config,
}: {
  config: Record<string, string>;
}) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(
    updateConfig,
    {},
  );

  const phone = config.whatsapp_phone === "0000000000" ? "" : config.whatsapp_phone;

  return (
    <form action={action} className="flex max-w-lg flex-col gap-5">
      <Field
        label="WhatsApp del negocio"
        hint="Formato internacional sin +, solo dígitos (ej. 5358260354). Aquí llegan los pedidos."
      >
        <Input
          name="whatsapp_phone"
          inputMode="numeric"
          defaultValue={phone}
          placeholder="5358260354"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Precio por libra (USD)">
          <Input
            name="precio_por_lb"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={config.precio_por_lb ?? ""}
            placeholder="7.00"
          />
        </Field>
        <Field
          label="Recargo express por libra (USD)"
          hint="Se suma al precio por libra solo en pedidos de 10+ lb. Cubre el extra del transportista (~$1.15) + tu servicio."
        >
          <Input
            name="recargo_express_por_lb"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            defaultValue={config.recargo_express_por_lb ?? "2.65"}
            placeholder="2.65"
          />
        </Field>
      </div>

      <Field
        label="Factor de markup"
        hint="Multiplicador de referencia para cálculos manuales."
      >
        <Input
          name="markup_factor"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="1"
          defaultValue={config.markup_factor ?? ""}
          placeholder="1.30"
          className="max-w-[12rem]"
        />
      </Field>

      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && <Alert tone="success">Configuración guardada.</Alert>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar configuración"}
      </button>
    </form>
  );
}
