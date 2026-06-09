"use client";

import { useActionState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { updateProfile, type ProfileState } from "@/features/profile/actions";

type Initial = {
  nombre?: string | null;
  telefono?: string | null;
  direccion?: string | null;
};

/**
 * Editable profile form. Used both on /perfil (edit anytime) and on
 * /perfil/completar (forced before ordering). Pass `next` to redirect back
 * into the order flow after saving.
 */
export function ProfileForm({
  initial,
  next,
  submitLabel = "Guardar",
}: {
  initial: Initial;
  next?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}

      <Field label="Nombre">
        <Input
          name="nombre"
          defaultValue={initial.nombre ?? ""}
          autoComplete="name"
          placeholder="Tu nombre"
          required
        />
      </Field>

      <Field label="Teléfono" hint="Para coordinar la entrega por WhatsApp.">
        <Input
          name="telefono"
          type="tel"
          inputMode="tel"
          defaultValue={initial.telefono ?? ""}
          autoComplete="tel"
          placeholder="+53 5xxxxxxx"
          required
        />
      </Field>

      <Field label="Dirección (opcional)">
        <Textarea
          name="direccion"
          defaultValue={initial.direccion ?? ""}
          autoComplete="street-address"
          placeholder="Provincia, municipio, dirección…"
        />
      </Field>

      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && <Alert tone="success">{state.ok}</Alert>}

      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending ? "Guardando…" : submitLabel}
      </Button>
    </form>
  );
}
