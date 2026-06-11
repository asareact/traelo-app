"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { routes } from "@/config/site";
import { deleteOrder, type CreateOrderState } from "@/features/orders/actions";

/**
 * Compact edit/delete controls overlaid on an order card. Rendered as a SIBLING
 * of the card's <Link> (never nested inside it — a button inside an anchor is
 * invalid and would also fire the navigation). Shown only for the owner while
 * the order is still editable; the page decides when to render it.
 */
export function OrderCardActions({ pedidoId }: { pedidoId: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    CreateOrderState,
    FormData
  >(deleteOrder, {});

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] bg-bg transition active:scale-95";

  return (
    <>
      <div className="flex gap-2">
        <Link
          href={routes.editarPedido(pedidoId)}
          aria-label="Editar pedido"
          className={`${btn} border-border text-muted hover:text-text`}
        >
          <Pencil size={16} />
        </Link>
        <button
          type="button"
          aria-label="Eliminar pedido"
          onClick={() => setConfirmOpen(true)}
          className={`${btn} border-error/30 text-error/80 hover:text-error`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h2 className="font-display text-xl font-bold text-text">
          ¿Eliminar este pedido?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Se borrará para siempre, con todos sus productos. Esta acción no se
          puede deshacer.
        </p>

        {state.error && (
          <Alert tone="error" className="mt-4">
            {state.error}
          </Alert>
        )}

        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="pedidoId" value={pedidoId} />
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="w-full bg-error text-white hover:bg-error hover:opacity-90"
          >
            {pending ? "Eliminando…" : "Sí, eliminar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirmOpen(false)}
            className="w-full"
            disabled={pending}
          >
            Cancelar
          </Button>
        </form>
      </Modal>
    </>
  );
}
