import { useCurrency } from "@/contexts/CurrencyContext";
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from "@/lib/currency";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 gap-1" aria-label="Change display currency">
          <span className="text-base leading-none">{CURRENCIES[currency].symbol}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {CURRENCY_CODES.map((c: CurrencyCode) => (
          <DropdownMenuItem key={c} onClick={() => setCurrency(c)} className="gap-2">
            <span className="w-4 text-center">{CURRENCIES[c].symbol}</span>
            <span className="flex-1">{c} — {CURRENCIES[c].label}</span>
            {c === currency && <Check className="size-3.5 text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
