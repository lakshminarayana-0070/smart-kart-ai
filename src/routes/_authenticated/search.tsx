import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search, Mic, Sparkles, TrendingUp } from "lucide-react";
import { ProductCard, type Product } from "@/components/app/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/_authenticated/search")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Smart AI Search — Smart Kart AI" }] }),
  component: SearchPage,
});

const SUGGESTIONS = ["wireless earbuds under $200", "minimalist hoodie", "home espresso machine", "yoga mat", "AI book"];

function SearchPage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const navigate = Route.useNavigate();
  const { user } = useAuth();

  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      if (!q) {
        const { data } = await supabase.from("products").select("*").limit(12);
        return data as Product[];
      }
      const { data } = await supabase.from("products").select("*")
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`).limit(24);
      if (user) await supabase.from("search_history").insert({ user_id: user.id, query: q });
      return data as Product[];
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { q: query } });
  };

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
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. comfortable running shoes under $150"
              className="h-12 pl-11 pr-12 rounded-full bg-background/50 border-primary/20" />
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

      <div className="mb-4 text-sm text-muted-foreground">
        {q ? `Results for "${q}"` : "All products"} · {isFetching ? "searching…" : `${data?.length ?? 0} found`}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(data ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
