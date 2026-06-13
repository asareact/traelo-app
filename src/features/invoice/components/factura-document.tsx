import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Image,
} from "@react-pdf/renderer";
import { brandColors, business, politicaReembolso } from "@/config/business";
import type { FacturaData, ParteFactura } from "../domain/factura";

/** $1,234.50 — invoice money. en-US grouping so it reads like the model. */
function usd(n: number | null): string {
  if (n == null) return "—";
  return (
    "$" +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)
  );
}

const C = brandColors;

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingHorizontal: 44,
    paddingBottom: 56,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: C.text,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandName: { fontSize: 15, fontFamily: "Helvetica-Bold", marginLeft: 9 },
  facturaTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  facturaNum: { fontSize: 8, color: C.muted, textAlign: "right", marginTop: 3 },
  rule: { height: 2.5, backgroundColor: C.text, marginTop: 18, marginBottom: 18 },
  // Meta row (date / issued by)
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  metaLabel: {
    fontSize: 7,
    color: C.muted,
    letterSpacing: 1,
    marginBottom: 3,
  },
  metaValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  // Parties
  parties: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 },
  partyName: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  partyLine: { fontSize: 8.5, color: C.muted, marginBottom: 2 },
  // Table
  table: { marginTop: 30, borderRadius: 4, borderWidth: 1, borderColor: C.border },
  thead: {
    flexDirection: "row",
    backgroundColor: C.surface,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  th: { fontSize: 7, color: C.muted, letterSpacing: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  rowAlt: { backgroundColor: "#FBF9F5" },
  // Columns
  colDesc: { flex: 1, flexDirection: "row", alignItems: "center", paddingRight: 8 },
  colQty: { width: 38, textAlign: "center" },
  colPrice: { width: 64, textAlign: "right" },
  colAmount: { width: 70, textAlign: "right" },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 9,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: C.border,
  },
  thumbPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 9,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  desc: { fontSize: 8.5, lineHeight: 1.35 },
  cell: { fontSize: 8.5, color: C.muted },
  cellAmount: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  // Totals
  totals: { marginTop: 18, alignSelf: "flex-end", width: 230 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 9, color: C.muted },
  totalValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 9,
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  grandLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  grandValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.primary },
  expressBadge: {
    fontSize: 7,
    color: C.primary,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  // Refund policy note
  policy: {
    marginTop: 24,
    padding: 11,
    backgroundColor: C.surface,
    borderRadius: 4,
  },
  policyTitle: {
    fontSize: 7,
    color: C.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  policyText: { fontSize: 7.5, color: C.muted, lineHeight: 1.45 },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  footerThanks: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  footerNote: { fontSize: 7.5, color: C.muted, marginTop: 2 },
  footerBrand: { fontSize: 7.5, color: C.muted },
});

/** Traelo logo mark (box + arrow), ported from logo.tsx to react-pdf SVG. */
function LogoMark() {
  return (
    <Svg width={30} height={30} viewBox="0 0 48 48">
      <Path d="M8 20 L24 27 L24 44 L8 36 Z" fill={C.primaryDark} />
      <Path d="M40 20 L24 27 L24 44 L40 36 Z" fill={C.primary} />
      <Path d="M8 20 L16 16 L32 23 L24 27 Z" fill="#D5673D" />
      <Path d="M40 20 L32 16 L16 23 L24 27 Z" fill={C.primary} />
      <Path
        d="M30 6 C 34 12, 34 18, 27 22 L31 22 L24 30 L17 22 L21 22 C 26 18, 25 12, 22 9"
        fill={C.teal}
      />
    </Svg>
  );
}

function Party({ titulo, parte }: { titulo: string; parte: ParteFactura }) {
  return (
    <View style={{ maxWidth: "48%" }}>
      <Text style={styles.metaLabel}>{titulo}</Text>
      <Text style={styles.partyName}>{parte.nombre}</Text>
      {parte.direccion.map((l, i) => (
        <Text key={`d${i}`} style={styles.partyLine}>
          {l}
        </Text>
      ))}
      {parte.telefono && <Text style={styles.partyLine}>{parte.telefono}</Text>}
      {parte.email && <Text style={styles.partyLine}>{parte.email}</Text>}
    </View>
  );
}

/** The full invoice as a PDF document. Pure render — data comes from the query. */
export function FacturaDocument({ data }: { data: FacturaData }) {
  const { desglose } = data;
  return (
    <Document
      title={`Factura ${data.numero}`}
      author={business.marca}
      subject="Factura de compra"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <LogoMark />
            <Text style={styles.brandName}>{business.marca}</Text>
          </View>
          <View>
            <Text style={styles.facturaTitle}>Factura</Text>
            <Text style={styles.facturaNum}>#{data.numero}</Text>
          </View>
        </View>

        <View style={styles.rule} />

        {/* Meta */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>FECHA</Text>
            <Text style={styles.metaValue}>{data.fechaIso.slice(0, 10)}</Text>
          </View>
          <View>
            <Text style={[styles.metaLabel, { textAlign: "right" }]}>
              EMITIDA POR
            </Text>
            <Text style={styles.metaValue}>{data.emisor.nombre}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.parties}>
          <Party titulo="DE" parte={data.emisor} />
          <Party titulo="PARA" parte={data.cliente} />
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.th, styles.colDesc]}>DESCRIPCIÓN</Text>
            <Text style={[styles.th, styles.colQty]}>CANT.</Text>
            <Text style={[styles.th, styles.colPrice]}>PRECIO</Text>
            <Text style={[styles.th, styles.colAmount]}>IMPORTE</Text>
          </View>
          {data.lineas.map((l, i) => (
            <View
              key={i}
              style={i % 2 === 1 ? [styles.row, styles.rowAlt] : styles.row}
              wrap={false}
            >
              <View style={styles.colDesc}>
                {l.imagen ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image src={l.imagen} style={styles.thumb} />
                ) : (
                  <View style={styles.thumbPlaceholder} />
                )}
                <Text style={styles.desc}>{l.descripcion}</Text>
              </View>
              <Text style={[styles.cell, styles.colQty]}>{l.cantidad}</Text>
              <Text style={[styles.cell, styles.colPrice]}>
                {usd(l.precioUnit)}
              </Text>
              <Text style={[styles.cellAmount, styles.colAmount]}>
                {usd(l.importe)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal productos</Text>
            <Text style={styles.totalValue}>{usd(desglose.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {data.tipoEnvio === "express"
                ? "Envío express a Cuba"
                : "Envío a Cuba"}
              {data.pesoLb != null ? ` (${data.pesoLb} lb)` : ""}
            </Text>
            <Text style={styles.totalValue}>
              {desglose.envioPendiente ? "Por confirmar" : usd(desglose.envio)}
            </Text>
          </View>
          {desglose.recargoExpress != null && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Recargo express</Text>
              <Text style={styles.totalValue}>
                {usd(desglose.recargoExpress)}
              </Text>
            </View>
          )}
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{usd(desglose.total)}</Text>
          </View>
        </View>

        {/* Refund policy */}
        <View style={styles.policy} wrap={false}>
          <Text style={styles.policyTitle}>POLÍTICA DE REEMBOLSO</Text>
          <Text style={styles.policyText}>{politicaReembolso}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerThanks}>Gracias por tu compra</Text>
            <Text style={styles.footerNote}>
              El total final puede variar tras confirmar el peso del paquete.
            </Text>
          </View>
          <Text style={styles.footerBrand}>{business.marca}</Text>
        </View>
      </Page>
    </Document>
  );
}
