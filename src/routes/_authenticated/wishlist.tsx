import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProductCard, type Product } from "@/components/app/ProductCard";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Smart Kart AI" }] }),
  component: () => {
    const { user } = useAuth();
    const { data } = useQuery({
      queryKey: ["wishlist", user?.id],
      enabled: !!user,
      queryFn: async () => {
        const { data } = await supabase.from("wishlist").select("product:products(*)").eq("user_id", user!.id);
        return (data ?? []).map((r: any) => r.product) as Product[];
      },
    });
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your wishlist</h1>
        {(!data || data.length === 0) ? (
          <p className="text-muted-foreground">Nothing saved yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    );
  },
});
