import "server-only";
import { serverEnv } from "@/lib/env.server";
import type { TasasCambio } from "./domain";

/**
 * Today's informal CUP exchange rates from cubanomic (the same feed the public
 * widget uses). Uses the `median` value (the representative "day rate"). Cached
 * 1h. Best-effort: returns null on any failure or bad shape so callers hide the
 * rate block instead of showing a stale/fake number.
 */
export async function getCambioCup(): Promise<TasasCambio | null> {
  try {
    const url = `https://api.cubanomic.com/api/v2/x-rates?msg=false&x_cur=CUP&token=${serverEnv.CUBANOMIC_TOKEN}`;
    const res = await fetch(url, {
      headers: {
        accept: "application/json, text/plain, */*",
        origin: "https://iframe.cubanomic.com",
        referer: "https://iframe.cubanomic.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      statistics?: Record<string, { median?: number }>;
    };
    const usdCup = data.statistics?.["USD.CUP"]?.median;
    const mlcCup = data.statistics?.["MLC.CUP"]?.median;

    if (
      typeof usdCup !== "number" ||
      typeof mlcCup !== "number" ||
      usdCup <= 0 ||
      mlcCup <= 0
    ) {
      return null;
    }

    return { usdCup, mlcCup, usdMlc: usdCup / mlcCup };
  } catch {
    return null;
  }
}
