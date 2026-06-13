"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { guardarSuscripcion, eliminarSuscripcion } from "@/features/push/actions";

/** Convert a base64url VAPID public key to the Uint8Array the Push API wants.
 *  Built on a concrete ArrayBuffer so it satisfies BufferSource (TS 5.7+). */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type Estado = "loading" | "unsupported" | "off" | "on" | "denied";

/**
 * "Activar notificaciones" card. Requests permission, subscribes via the service
 * worker's PushManager, and stores the subscription server-side. Hides itself
 * where push isn't available (unsupported browser, or VAPID not configured).
 * On iOS, push only works once the app is installed to the home screen.
 */
export function NotificationToggle() {
  const vapid = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const [estado, setEstado] = useState<Estado>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window &&
        !!vapid;
      if (!supported) {
        setEstado("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setEstado("denied");
        return;
      }
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) =>
          setEstado(sub && Notification.permission === "granted" ? "on" : "off"),
        )
        .catch(() => setEstado("off"));
    });
    return () => cancelAnimationFrame(id);
  }, [vapid]);

  async function activar() {
    if (!vapid) return;
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setEstado(perm === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const res = await guardarSuscripcion(sub.toJSON());
      setEstado(res.ok ? "on" : "off");
    } catch {
      setEstado("off");
    } finally {
      setBusy(false);
    }
  }

  async function desactivar() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await eliminarSuscripcion(sub.endpoint);
        await sub.unsubscribe();
      }
    } catch {
      // ignore
    } finally {
      setEstado("off");
      setBusy(false);
    }
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
          onClick={desactivar}
          disabled={busy}
          className="mt-4 w-full"
        >
          {busy ? "Un momento…" : "Desactivar notificaciones"}
        </Button>
      ) : estado === "off" ? (
        <Button
          type="button"
          onClick={activar}
          disabled={busy}
          className="mt-4 w-full"
        >
          {busy ? "Un momento…" : "Activar notificaciones"}
        </Button>
      ) : null}
    </div>
  );
}
