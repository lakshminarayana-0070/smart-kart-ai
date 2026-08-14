import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/app/ProductCard";
import { formatPrice, normalizeCurrency } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({ meta: [{ title: "Budget AI — Smart Kart AI" }] }),
  component: BudgetPage,
});

function BudgetPage() {
  const [budget, setBudget] = useState("");
  const [submitted, setSubmitted] = useState<number | null>(null);

  const { data: bundle, isFetching } = useQuery({
    queryKey: ["bundle", submitted],
    enabled: submitted !== null,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").lte("price", submitted!).order("rating", { ascending: false }).limit(20);
      const all = (data ?? []) as Product[];
      // greedy bundle
      const picked: Product[] = []; let total = 0;
      for (const p of all) { if (total + Number(p.price) <= submitted!) { picked.push(p); total += Number(p.price); } if (picked.length >= 5) break; }
      const currency = normalizeCurrency((all[0] as any)?.currency, "USD");
      return { picked, total, alternatives: all.slice(0, 8), currency };
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl bg-gradient-card border ai-border p-6 md:p-10">
        <div className="text-xs uppercase tracking-widest text-accent mb-2 flex items-center gap-1"><Sparkles className="size-3" /> Budget Assistant</div>
        <h1 className="text-3xl font-bold mb-3">Tell us your budget. We'll build the cart.</h1>
        <p className="text-muted-foreground mb-6">AI assembles best-value bundles tailored to your spend.</p>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(Number(budget)); }} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Wallet className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="number" min="10" placeholder="Enter your budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="h-12 pl-11" />
          </div>
          <Button type="submit" className="h-12 px-6 bg-gradient-primary text-primary-foreground glow">Optimize</Button>
        </form>
      </div>

      {submitted !== null && (
        <div className="mt-10 space-y-8">
          {isFetching ? <div className="text-muted-foreground">AI is optimizing…</div> : (
            <>
              <div className="rounded-2xl glass ai-border p-5">
                <div className="text-xs uppercase tracking-widest text-accent mb-1">AI Bundle</div>
                <div className="text-lg font-bold">Best-value bundle for {formatPrice(submitted, bundle?.currency)}</div>
                <div className="text-sm text-muted-foreground">
                  Selected {bundle?.picked.length} items · total {formatPrice(bundle?.total, bundle?.currency)} · saves {formatPrice(submitted - (bundle?.total ?? 0), bundle?.currency)}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {(bundle?.picked ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
              <h2 className="text-xl font-bold pt-4">More within your budget</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(bundle?.alternatives ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
