import { renderToBuffer } from "@react-pdf/renderer";
import { getFacturaData, FacturaDocument } from "@/features/invoice";

// @react-pdf/renderer needs the Node runtime (fontkit, Buffer, streams).
export const runtime = "nodejs";
// The invoice depends on live order data — never cache it.
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/factura/:pedidoId — stream the order's invoice as a PDF.
 * Admin-only and only for PAGADO+ orders (enforced in getFacturaData, which
 * returns null otherwise → 403/404 here). The browser downloads it as a file.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pedidoId: string }> },
) {
  const { pedidoId } = await params;

  const data = await getFacturaData(pedidoId);
  if (!data) {
    return new Response("No autorizado o pedido no facturable.", {
      status: 403,
    });
  }

  const pdf = await renderToBuffer(<FacturaDocument data={data} />);

  return new Response(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${data.numero}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
