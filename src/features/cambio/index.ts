/**
 * Exchange-rate feature — client-safe surface. Server-only data access lives in
 * ./queries (imported directly by pages), never re-exported here.
 */

export {
  type TasasCambio,
  convertirUsd,
  fmtCup,
  fmtMlc,
} from "./domain";
export { CambioLine } from "./components/cambio-line";
