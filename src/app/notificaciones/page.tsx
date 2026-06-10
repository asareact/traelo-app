import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { IconBell } from "@/components/brand/icons";
import { formatDateTime } from "@/lib/utils/format";
import { getMisNotificaciones } from "@/features/notifications/queries";

export const metadata: Metadata = { title: "Notificaciones — Traelo" };

export default async function NotificacionesPage() {
  const notificaciones = await getMisNotificaciones();

  return (
    <AppShell>
      {notificaciones.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
            <IconBell size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-text">
            No tienes notificaciones
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Aquí te avisaremos cuando cambie el estado de tus pedidos.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {notificaciones.map((n) => (
            <li key={n.id}>
              <Card className="p-4">
                <p className="text-sm text-text">{n.mensaje ?? n.tipo}</p>
                <p className="mt-1 text-xs text-muted">
                  {formatDateTime(n.created_at)}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
