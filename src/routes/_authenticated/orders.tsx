import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — Smart Kart AI" }] }),
  component: () => {
    const { user } = useAuth();
    const { data } = useQuery({
      queryKey: ["orders", user?.id],
      enabled: !!user,
      queryFn: async () => (await supabase.from("orders").select("*, items:order_items(*, product:products(name,image_url))").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
    });
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your orders</h1>
        {(!data || data.length === 0) ? (
          <p className="text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {data.map((o: any) => (
              <div key={o.id} className="rounded-2xl bg-gradient-card border p-5">
                <div className="flex justify-between mb-3">
                  <div>
                    <div className="font-medium">Order #{o.id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${Number(o.total).toFixed(2)}</div>
                    <div className="text-xs text-accent uppercase">{o.status}</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(o.items ?? []).map((it: any) => (
                    <div key={it.id} className="flex items-center gap-2 text-sm">
                      <img src={it.product?.image_url} className="size-10 rounded object-cover" />
                      <span>{it.product?.name} × {it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
