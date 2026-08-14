import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CURRENCIES, DEFAULT_CURRENCY, normalizeCurrency, type CurrencyCode } from "@/lib/currency";

const STORAGE_KEY = "smartkart.currency";

type Ctx = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  symbol: string;
};

const CurrencyContext = createContext<Ctx>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  symbol: CURRENCIES[DEFAULT_CURRENCY].symbol,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  // Read persisted preference after hydration (avoids SSR mismatch).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setCurrencyState(normalizeCurrency(saved));
    } catch {
      /* storage unavailable — keep default */
    }
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ currency, setCurrency, symbol: CURRENCIES[currency].symbol }),
    [currency, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/** Preferred display currency. Product prices still render in their own stored currency. */
export const useCurrency = () => useContext(CurrencyContext);
