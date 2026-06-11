"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { registrarPeso } from "@/features/admin/actions";
import type { KanbanPedido } from "@/features/admin/queries";

/**
 * Register the package weight + an optional evidence photo. The photo is
 * uploaded to the public `evidencias` Storage bucket straight from the browser
 * (admin RLS allows it), then the resulting URL is saved with the weight via the
 * `registrarPeso` action. Uploading client-side avoids server-action body limits.
 */
export function WeightModal({
  pedido,
  onClose,
  onSaved,
}: {
  pedido: KanbanPedido | null;
  onClose: () => void;
  /** Called after a successful save, with the entered weight and recomputed total
   *  — lets the board offer an optional WhatsApp notice to the client. */
  onSaved: (pedido: KanbanPedido, pesoLb: number, total: number | null) => void;
}) {
  return (
    <Modal open={pedido != null} onClose={onClose} className="sm:max-w-md">
      {pedido && <Body pedido={pedido} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function Body({
  pedido,
  onClose,
  onSaved,
}: {
  pedido: KanbanPedido;
  onClose: () => void;
  onSaved: (pedido: KanbanPedido, pesoLb: number, total: number | null) => void;
}) {
  const router = useRouter();
  const [peso, setPeso] = useState(
    pedido.peso_lb != null ? String(pedido.peso_lb) : "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(pedido.peso_evidencia_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.type.startsWith("image/")) {
      setError("La evidencia debe ser una imagen.");
      return;
    }
    if (f && f.size > 8 * 1024 * 1024) {
      setError("La imagen es muy grande (máx 8MB).");
      return;
    }
    setError("");
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function save() {
    setError("");
    const pesoNum = parseFloat(peso.replace(",", "."));
    if (!Number.isFinite(pesoNum) || pesoNum <= 0) {
      setError("Ingresa un peso válido en libras.");
      return;
    }
    setSaving(true);
    try {
      let evidenciaUrl = "";
      if (file) {
        const supabase = createClient();
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${pedido.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("evidencias")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) {
          setError("No se pudo subir la imagen: " + upErr.message);
          setSaving(false);
          return;
        }
        evidenciaUrl = supabase.storage
          .from("evidencias")
          .getPublicUrl(path).data.publicUrl;
      }

      const fd = new FormData();
      fd.set("pedidoId", pedido.id);
      fd.set("peso_lb", String(pesoNum));
      if (evidenciaUrl) fd.set("evidencia_url", evidenciaUrl);

      const res = await registrarPeso({}, fd);
      if (res?.error) {
        setError(res.error);
        setSaving(false);
        return;
      }
      router.refresh();
      onSaved(pedido, pesoNum, res.total ?? null);
      onClose();
    } catch {
      setError("Error al guardar el peso.");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-xl font-bold text-text">
        Registrar peso
      </h2>
      <p className="mt-1 text-sm text-muted">
        Pedido #{pedido.id.slice(0, 8)} · {pedido.cliente?.nombre || "Cliente"}
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <Field label="Peso del paquete (lb)">
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="0.00"
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
            Evidencia (foto del paquete en la balanza)
          </span>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Evidencia del peso"
              className="mb-2 max-h-48 w-full rounded-xl border border-border object-contain bg-bg"
            />
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPick}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-bold file:text-text"
          />
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="mt-1 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar peso"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full rounded-full px-5 py-2.5 text-sm font-bold text-muted transition hover:bg-surface disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
