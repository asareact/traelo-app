"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { IconWhatsapp } from "@/components/brand/icons";
import { whatsappLink } from "@/lib/whatsapp";
import {
  mensajeCambioEstado,
  nombreProductoEs,
  linkRastreo,
} from "@/features/orders";
import type { Estado } from "@/features/orders/domain/estados";
import { ESTADO_ADMIN_LABEL } from "@/features/admin/domain/kanban";
import type { KanbanPedido } from "@/features/admin/queries";

/**
 * After a state move, the admin OPTIONALLY notifies the client on WhatsApp. The
 * message is built from a reusable template for the target state (product names
 * + order details + tracking link — never a SHEIN link) and is fully editable
 * before sending. Sending just opens a prefilled wa.me chat to the client.
 */
export function NotifyClientModal({
  pedido,
  nuevoEstado,
  siteUrl,
  onClose,
}: {
  pedido: KanbanPedido | null;
  nuevoEstado: Estado | null;
  siteUrl?: string | null;
  onClose: () => void;
}) {
  const open = pedido != null && nuevoEstado != null;
  return (
    <Modal open={open} onClose={onClose} className="sm:max-w-lg">
      {pedido && nuevoEstado && (
        <Body
          pedido={pedido}
          nuevoEstado={nuevoEstado}
          siteUrl={siteUrl}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function Body({
  pedido,
  nuevoEstado,
  siteUrl,
  onClose,
}: {
  pedido: KanbanPedido;
  nuevoEstado: Estado;
  siteUrl?: string | null;
  onClose: () => void;
}) {
  const productos = pedido.items.map((it) => ({
    nombre: it.producto_nombre || nombreProductoEs(it.shein_url) || "Producto",
    talla: it.talla,
    color: it.color,
    cantidad: it.cantidad,
  }));
  const trackingUrl = linkRastreo(siteUrl, pedido.id);

  const [mensaje, setMensaje] = useState(() =>
    mensajeCambioEstado({
      idCorto: pedido.id.slice(0, 8),
      estado: nuevoEstado,
      nombreCliente: pedido.cliente?.nombre,
      productos,
      trackingUrl,
      valorUsd: pedido.total_real_usd,
      pesoLb: pedido.peso_lb,
    }),
  );

  const waHref = whatsappLink(pedido.cliente?.telefono, mensaje);

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-xl font-bold text-text">
        Avisar al cliente
      </h2>
      <p className="mt-1 text-sm text-muted">
        Movido a{" "}
        <span className="font-bold text-text">
          {ESTADO_ADMIN_LABEL[nuevoEstado]}
        </span>
        . Puedes enviarle este mensaje por WhatsApp (opcional).
      </p>

      <Textarea
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        rows={10}
        className="mt-4 text-sm"
      />

      {!waHref && (
        <Alert tone="info" className="mt-3">
          Este cliente no tiene un teléfono válido en su perfil, así que no se
          puede enviar el WhatsApp.
        </Alert>
      )}

      <div className="mt-5 flex flex-col gap-2.5">
        <button
          type="button"
          disabled={!waHref}
          onClick={() => {
            if (waHref) window.open(waHref, "_blank", "noopener,noreferrer");
            onClose();
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <IconWhatsapp size={18} />
          Enviar por WhatsApp
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full px-5 py-2.5 text-sm font-bold text-muted transition hover:bg-surface"
        >
          No notificar
        </button>
      </div>
    </div>
  );
}
