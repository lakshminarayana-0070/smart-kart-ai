import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/app/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Zap, Camera, Wallet } from "lucide-react";
import * as Icons from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "Your AI feed — Smart Kart AI" }] }),
  component: Home,
});

function Home() {
  const { user } = useAuth();

  const { data: featured } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => (await supabase.from("products").select("*").eq("is_featured", true).limit(8)).data as Product[],
  });
  const { data: trending } = useQuery({
    queryKey: ["trending-home"],
    queryFn: async () => (await supabase.from("products").select("*").eq("is_trending", true).limit(8)).data as Product[],
  });
  const { data: all } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => (await supabase.from("products").select("*").limit(12)).data as Product[],
  });
  const { data: cats } = useQuery({
    queryKey: ["cats"],
    queryFn: async () => (await supabase.from("categories").select("*")).data,
  });
  const { data: recent } = useQuery({
    queryKey: ["recent", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("recently_viewed").select("product:products(*)").order("viewed_at", { ascending: false }).limit(6);
      return (data ?? []).map((r: any) => r.product) as Product[];
    },
  });

  const firstName = (user?.user_metadata?.full_name as string)?.split(" ")[0] ?? "Shopper";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-12">
      <div className="rounded-3xl bg-gradient-card border ai-border p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="text-xs uppercase tracking-widest text-accent mb-2 flex items-center gap-1">
          <Sparkles className="size-3" /> AI personalized
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Hey {firstName}, your feed is ready.</h1>
        <p className="text-muted-foreground max-w-xl">Today's picks are tuned to your style and budget. Try a camera search or set a budget to discover bundles.</p>
        <div className="flex gap-2 mt-6">
          <Link to="/camera" className="px-4 h-10 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium glow">
            <Camera className="size-4" /> Snap to find
          </Link>
          <Link to="/budget" className="px-4 h-10 inline-flex items-center gap-2 rounded-full glass text-sm">
            <Wallet className="size-4" /> Budget mode
          </Link>
        </div>
      </div>

      {cats && (
        <div>
          <h2 className="text-xl font-bold mb-4">Smart categories</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {cats.map((c: any) => {
              const Ico = (Icons as any)[c.icon] ?? Sparkles;
              return (
                <Link key={c.id} to="/search" search={{ q: c.name }} className="group rounded-2xl bg-gradient-card border p-4 text-center hover:border-primary/40 hover:glow transition">
                  <Ico className="size-6 mx-auto mb-2 text-accent" />
                  <div className="text-sm font-medium">{c.name}</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <Section title="Recommended For You" subtitle="Picked by AI based on your activity">
        {(featured ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
      </Section>

      <div className="rounded-2xl bg-gradient-primary p-6 flex items-center gap-4 text-primary-foreground">
        <Zap className="size-8" />
        <div className="flex-1">
          <div className="font-bold">Flash deals dropping every hour</div>
          <div className="text-sm opacity-90">AI matches deals to your wishlist instantly.</div>
        </div>
      </div>

      <Section title="Trending For You">
        {(trending ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
      </Section>

      {recent && recent.length > 0 && (
        <Section title="Recently viewed">
          {recent.map((p) => <ProductCard key={p.id} p={p} />)}
        </Section>
      )}

      <Section title="Smart suggestions">
        {(all ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{children}</div>
    </section>
  );
}
