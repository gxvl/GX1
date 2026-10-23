import { cacheLife, cacheTag } from "next/cache";

// Header written by src/proxy.ts before the page renders.
export const COUNTRY_HEADER = "x-gx1-country";

const EURO = ["AT", "BE", "DE", "ES", "FI", "FR", "GR", "IE", "IT", "NL", "PT"];

const currencyByCountry: Record<string, string> = {
  US: "USD",
  BR: "BRL",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  JP: "JPY",
  MX: "MXN",
  IN: "INR",
  KR: "KRW",
  CH: "CHF",
  ...Object.fromEntries(EURO.map((c) => [c, "EUR"])),
};

export type Region = {
  country: string;
  countryName: string;
  currency: string;
};

export function resolveRegion(country: string | null | undefined): Region {
  const code = country && /^[A-Z]{2}$/.test(country) ? country : "US";
  const currency = currencyByCountry[code] ?? "USD";
  const countryName =
    new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  return { country: code, countryName, currency };
}

type Rates = { rates: Record<string, number>; updated: string } | null;

/**
 * USD exchange rates, fetched with Next's native fetch and cached for hours.
 * Everyone shares the same entry; `revalidateTag("fx")` refreshes it on demand.
 */
export async function getUsdRates(): Promise<Rates> {
  "use cache";
  cacheLife("hours");
  cacheTag("fx");

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result: string;
      rates: Record<string, number>;
      time_last_update_utc: string;
    };
    if (data.result !== "success") return null;
    return { rates: data.rates, updated: data.time_last_update_utc };
  } catch {
    return null;
  }
}

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
