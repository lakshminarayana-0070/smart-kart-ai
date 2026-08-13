import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Heart, Search, Sparkles, Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Smart Kart AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: counts } = useQuery({
    queryKey: ["dash-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [orders, wish, hist] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("wishlist").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("search_history").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      return { orders: orders.count ?? 0, wish: wish.count ?? 0, searches: hist.count ?? 0 };
    },
  });

  const cards = [
    { to: "/orders", icon: ShoppingBag, label: "Orders", value: counts?.orders ?? 0 },
    { to: "/wishlist", icon: Heart, label: "Wishlist", value: counts?.wish ?? 0 },
    { to: "/search", icon: Search, label: "AI searches", value: counts?.searches ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="rounded-3xl bg-gradient-card border ai-border p-8">
        <div className="text-xs uppercase tracking-widest text-accent mb-2 flex items-center gap-1"><Sparkles className="size-3" /> Your AI dashboard</div>
        <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl bg-gradient-card border p-6 hover:border-primary/40 hover:glow transition">
            <c.icon className="size-6 text-accent mb-3" />
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>
      <Link to="/seller/products" className="block rounded-2xl bg-gradient-card border p-6 hover:border-primary/40 hover:glow transition">
        <Package className="size-6 text-accent mb-3" />
        <div className="font-semibold">Sell on Smart Kart AI</div>
        <div className="text-sm text-muted-foreground">Add, edit and publish your own products.</div>
      </Link>
    </div>
  );
}
