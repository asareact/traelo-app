/**
 * Exchange-rate domain — pure conversion + formatting. USD is the base: amounts
 * are stored in USD and converted to CUP / MLC at the informal day rate. MLC is
 * expressed relative to USD (how many MLC equal that USD), derived from the two
 * CUP rates: 1 USD = usdCup CUP, and 1 USD = usdCup / mlcCup MLC.
 */

export type TasasCambio = {
  /** CUP per 1 USD (median, "al cambio del día"). */
  usdCup: number;
  /** CUP per 1 MLC. */
  mlcCup: number;
  /** MLC per 1 USD (usdCup / mlcCup). */
  usdMlc: number;
};

/** Convert a USD amount to CUP and MLC at the given rates. */
export function convertirUsd(
  usd: number,
  t: TasasCambio,
): { cup: number; mlc: number } {
  return { cup: usd * t.usdCup, mlc: usd * t.usdMlc };
}

/** CUP shown as a rounded integer with thousands separators (e.g. "26.880"). */
export function fmtCup(n: number): string {
  return Math.round(n).toLocaleString("es-ES");
}

/** MLC shown with 2 decimals (e.g. "1.42"). */
export function fmtMlc(n: number): string {
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
