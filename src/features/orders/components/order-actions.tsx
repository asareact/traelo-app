"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { routes } from "@/config/site";
import { deleteOrder, type CreateOrderState } from "@/features/orders/actions";

/**
 * Owner-only actions on the order detail page, shown only while the order is in
 * the editable (quote) window: edit the products or delete the whole order.
 * Rendered exclusively for the signed-in owner — never on the public tracking
 * view. Delete goes through a confirmation modal (it's irreversible).
 */
export function OrderActions({ pedidoId }: { pedidoId: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    CreateOrderState,
    FormData
  >(deleteOrder, {});

  return (
    <>
      <div className="flex gap-3">
        <Link
          href={routes.editarPedido(pedidoId)}
          className="flex-1 rounded-full border-[1.5px] border-border bg-surface py-3 text-center text-sm font-bold text-text transition active:scale-[0.98]"
        >
          Editar pedido
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex-1 rounded-full border-[1.5px] border-error/30 bg-error/[0.04] py-3 text-center text-sm font-bold text-error transition active:scale-[0.98]"
        >
          Eliminar
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
