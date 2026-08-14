import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2, Sparkles, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, normalizeCurrency } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({ meta: [{ title: "Cart — Smart Kart AI" }] }),
  component: CartPage,
});

function CartPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data: items } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => (await supabase.from("cart_items").select("id,quantity,product:products(*)").eq("user_id", user!.id)).data ?? [],
    enabled: !!user,
  });

  const total = (items ?? []).reduce((s: number, i: any) => s + Number(i.product.price) * i.quantity, 0);
  const cartCurrency = normalizeCurrency((items ?? [])[0]?.product?.currency, "USD");

  const update = async (id: string, q: number) => {
    if (q <= 0) await supabase.from("cart_items").delete().eq("id", id);
    else await supabase.from("cart_items").update({ quantity: q }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["cart"] });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your cart</h1>
      {(!items || items.length === 0) ? (
        <div className="rounded-2xl glass p-12 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link to="/home"><Button className="bg-gradient-primary text-primary-foreground">Start shopping</Button></Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((i: any) => (
              <div key={i.id} className="rounded-2xl bg-gradient-card border p-4 flex gap-4 items-center">
                <img src={i.product.image_url} className="size-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{i.product.name}</div>
                  <div className="text-sm text-muted-foreground">{formatPrice(i.product.price, i.product.currency)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="size-8" onClick={() => update(i.id, i.quantity - 1)}><Minus className="size-3" /></Button>
                  <span className="w-6 text-center">{i.quantity}</span>
                  <Button size="icon" variant="outline" className="size-8" onClick={() => update(i.id, i.quantity + 1)}><Plus className="size-3" /></Button>
                </div>
                <Button size="icon" variant="ghost" onClick={() => update(i.id, 0)}><Trash2 className="size-4" /></Button>
              </div>
            ))}
            <div className="rounded-2xl glass ai-border p-4 flex items-center gap-3">
              <Sparkles className="size-4 text-accent" />
              <span className="text-sm">AI suggestion: Add {formatPrice(Math.max(50 - total, 0), cartCurrency)} more for free shipping bundle.</span>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-card border p-6 h-fit space-y-4">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">{formatPrice(total, cartCurrency)}</span></div>
            <div className="flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span>Free</span></div>
            <Button onClick={() => nav({ to: "/checkout" })} className="w-full h-11 bg-gradient-primary text-primary-foreground glow">Checkout</Button>
          </div>
        </div>
      )}
    </div>
  );
}
