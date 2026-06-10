"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { IconWhatsapp } from "@/components/brand/icons";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Generic "notify the client on WhatsApp" editor. The caller builds the message
 * (state change, price change, …) from the reusable templates and passes it in;
 * this modal just shows it editable and opens a prefilled wa.me chat. Optional
 * and admin-controlled. No message copy lives here.
 */
export type NotifyData = {
  titulo: string;
  subtitulo?: string;
  telefono?: string | null;
  mensaje: string;
};

export function NotifyClientModal({
  data,
  onClose,
}: {
  data: NotifyData | null;
  onClose: () => void;
}) {
  return (
    <Modal open={data != null} onClose={onClose} className="sm:max-w-lg">
      {data && <Body data={data} onClose={onClose} />}
    </Modal>
  );
}

function Body({ data, onClose }: { data: NotifyData; onClose: () => void }) {
  const [mensaje, setMensaje] = useState(data.mensaje);
  const waHref = whatsappLink(data.telefono, mensaje);

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-xl font-bold text-text">{data.titulo}</h2>
      {data.subtitulo && (
        <p className="mt-1 text-sm text-muted">{data.subtitulo}</p>
      )}

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
