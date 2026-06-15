"use client";

import { useEffect } from "react";
import { estadoPush, activarPush } from "@/features/push/subscribe";

const FLAG = "traelo_push_auto"; // one attempt per session, so we don't re-prompt

/**
 * Auto-asks for notification permission once the user lands signed-in, so they
 * don't have to be told to go enable it. Only acts when push is supported AND the
 * permission is still undecided / not yet subscribed ("off"); never re-prompts if
 * already on, denied, or unsupported. Tries once per session. Renders nothing.
 *
 * Mounted in AppShell (every signed-in page). On iOS, requesting off a gesture is
 * rejected → it silently no-ops and the /perfil button remains the fallback.
 */
export function AutoSubscribe() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(FLAG)) return;
    } catch {
      return;
    }
    // Small delay so it doesn't fire on the very first paint.
    const t = window.setTimeout(async () => {
      const estado = await estadoPush();
      try {
        sessionStorage.setItem(FLAG, "1");
      } catch {
        // ignore
      }
      if (estado === "off") {
        await activarPush();
      }
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return null;
}
