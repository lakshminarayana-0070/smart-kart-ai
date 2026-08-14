/**
 * Smart Kart AI — single shared currency/price formatting utility.
 * Every customer-facing price MUST go through formatPrice().
 * NOTE: this formats prices in the currency they are stored in.
 * No exchange-rate conversion happens here (deliberately deferred).
 */

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

export const CURRENCIES: Record<CurrencyCode, { code: CurrencyCode; symbol: string; locale: string; label: string }> = {
  INR: { code: "INR", symbol: "₹", locale: "en-IN", label: "Indian Rupee" },
  USD: { code: "USD", symbol: "$", locale: "en-US", label: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", locale: "en-IE", label: "Euro" },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB", label: "British Pound" },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

/** Default customer-facing currency for Smart Kart AI. */
export const DEFAULT_CURRENCY: CurrencyCode = "INR";

/** Coerce any stored/unknown currency value to a supported code. */
export function normalizeCurrency(value: unknown, fallback: CurrencyCode = DEFAULT_CURRENCY): CurrencyCode {
  const code = typeof value === "string" ? (value.trim().toUpperCase() as CurrencyCode) : undefined;
  return code && code in CURRENCIES ? code : fallback;
}

/**
 * Locale-aware money formatting. INR → ₹49,999.00, USD → $599.99, etc.
 * Invalid amounts render as an em dash rather than "NaN".
 */
export function formatPrice(
  amount: number | string | null | undefined,
  currency?: unknown,
  opts: { maximumFractionDigits?: number; minimumFractionDigits?: number } = {},
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (value == null || !Number.isFinite(value)) return "—";
  const cur = CURRENCIES[normalizeCurrency(currency)];
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: "currency",
      currency: cur.code,
      minimumFractionDigits: opts.minimumFractionDigits ?? 2,
      maximumFractionDigits: opts.maximumFractionDigits ?? 2,
    }).format(value);
  } catch {
    return `${cur.symbol}${value.toFixed(2)}`;
  }
}
