"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  estadoPush,
  activarPush,
  desactivarPush,
  type EstadoPush,
} from "@/features/push/subscribe";

/**
 * "Activar notificaciones" card on /perfil. The on-login auto-subscribe
 * (AutoSubscribe) usually handles this already; this stays as the explicit
 * control to re-enable or turn off. Hides where push isn't available.
 */
export function NotificationToggle() {
  const [estado, setEstado] = useState<EstadoPush | "loading">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let activo = true;
    estadoPush().then((e) => {
      if (activo) setEstado(e);
    });
    return () => {
      activo = false;
    };
  }, []);

  async function onActivar() {
    setBusy(true);
    setEstado(await activarPush());
    setBusy(false);
  }

  async function onDesactivar() {
    setBusy(true);
    await desactivarPush();
    setEstado("off");
    setBusy(false);
  }

  if (estado === "loading" || estado === "unsupported") return null;

  return (
    <div className="rounded-[28px] border border-border bg-surface p-5">
      <p className="font-display text-base font-bold text-text">Notificaciones</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {estado === "on"
          ? "Activadas. Te avisamos cuando tu pedido avance o tengamos el costo final."
          : estado === "denied"
            ? "Están bloqueadas. Actívalas para este sitio en los ajustes de tu navegador."
            : "Recibe un aviso cuando tu pedido cambie de estado o tengamos el costo final del envío."}
      </p>

      {estado === "on" ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onDesactivar}
          disabled={busy}
          className="mt-4 w-full"
        >
          {busy ? "Un momento…" : "Desactivar notificaciones"}
        </Button>
      ) : estado === "off" ? (
        <Button
          type="button"
          onClick={onActivar}
          disabled={busy}
          className="mt-4 w-full"
        >
          {busy ? "Un momento…" : "Activar notificaciones"}
        </Button>
      ) : null}
    </div>
  );
}
