import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { Search, Mic, Sparkles, TrendingUp, X, Loader2, AlertTriangle } from "lucide-react";
import { ProductCard, type Product } from "@/components/app/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeQuery, rankProducts } from "@/lib/product-search";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/_authenticated/search")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Smart AI Search — Smart Kart AI" }] }),
  component: SearchPage,
});

const SUGGESTIONS = ["wireless earbuds", "laptop", "running shoes", "espresso", "fitness"];

/** Catalog rows visible to customers, with category names for search. */
const CATALOG_SELECT =
  "*, category:categories!products_category_id_fkey(name), subcategory:categories!products_subcategory_id_fkey(name)";

function SearchPage() {
  const { q } = Route.useSearch();
  const query = q ?? "";
  const [input, setInput] = useState(query);
  const navigate = Route.useNavigate();
  const { user } = useAuth();

  useEffect(() => setInput(query), [query]);

  // Debounce typing into the URL so /search?q=... stays shareable and refresh-safe.
  useEffect(() => {
    if (normalizeQuery(input) === normalizeQuery(query)) return;
    const t = setTimeout(() => {
      navigate({ search: input.trim() ? { q: input.trim() } : {}, replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [input, query, navigate]);

  // Single cached catalog fetch — no database round-trip per keystroke, no AI calls.
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["catalog-search"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(CATALOG_SELECT)
        .eq("status", "active")
        .order("review_count", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  });

  const results = useMemo(() => rankProducts((data ?? []) as any[], query) as Product[], [data, query]);

  // Log the search once it settles (never blocks rendering results).
  useEffect(() => {
    const term = normalizeQuery(query);
    if (!user || !term) return;
    const t = setTimeout(() => {
      supabase.from("search_history").insert({ user_id: user.id, query: term }).then(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [query, user]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: input.trim() ? { q: input.trim() } : {} });
  };

  const clear = () => {
    setInput("");
    navigate({ search: {} });
  };

  const count = results.length;
  const countLabel = count === 1 ? "1 product found" : `${count} products found`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-3xl bg-gradient-card border ai-border p-6 md:p-8 mb-8">
        <div className="text-xs uppercase tracking-widest text-accent mb-2 flex items-center gap-1">
          <Sparkles className="size-3" /> Smart AI Search
        </div>
        <h1 className="text-3xl font-bold mb-4">Ask in your own words.</h1>
        <form onSubmit={submit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. running shoes, laptop, espresso machine"
              aria-label="Search products"
              className="h-12 pl-11 pr-20 rounded-full bg-background/50 border-primary/20" />
            {input && (
              <button type="button" onClick={clear} aria-label="Clear search"
                className="absolute right-11 top-1/2 -translate-y-1/2 size-8 rounded-full grid place-items-center hover:bg-muted/50">
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full grid place-items-center hover:bg-accent/10">
              <Mic className="size-4 text-accent" />
            </button>
          </div>
          <Button type="submit" className="h-12 px-6 bg-gradient-primary text-primary-foreground glow">Search</Button>
        </form>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="size-3" /> Trending:</span>
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => navigate({ search: { q: s } })}
              className="text-xs px-3 py-1 rounded-full glass hover:border-primary/40">{s}</button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl glass p-10 text-center space-y-4">
          <AlertTriangle className="size-6 mx-auto text-destructive" />
          <p className="text-muted-foreground">We couldn't reach the catalog. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>Retry search</Button>
        </div>
      ) : isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-10">
          <Loader2 className="size-4 animate-spin" /> Searching the catalog…
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {query ? `Results for "${query}" · ${countLabel}` : `Browse the catalog · ${countLabel}`}
          </div>
          {count === 0 ? (
            <div className="rounded-2xl glass p-12 text-center space-y-3">
              <p className="font-medium">No products found for "{query}"</p>
              <p className="text-sm text-muted-foreground">Try a shorter word, a brand, or a category.</p>
              <Button variant="outline" onClick={clear}>Clear search</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
