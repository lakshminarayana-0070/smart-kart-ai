import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { placeOrderFn } from "@/lib/checkout.functions";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Smart Kart AI" }] }),
  component: Checkout,
});

function Checkout() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [coupon, setCoupon] = useState("");
  const [placing, setPlacing] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("cart_items").select("id,quantity,product:products(*)").eq("user_id", user!.id)).data ?? [],
  });
  const subtotal = (items ?? []).reduce((s: number, i: any) => s + Number(i.product.price) * i.quantity, 0);
  const discount = coupon.toUpperCase() === "AI10" ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const placeOrder = useServerFn(placeOrderFn);

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items || items.length === 0) return toast.error("Cart is empty");
    setPlacing(true);
    try {
      // Prices, discounts and totals are recomputed server-side from the products table.
      await placeOrder({ data: { coupon, shipping: { name, address, city } } });
      toast.success("Order placed!");
      nav({ to: "/orders" });
    } catch {
      toast.error("Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <form onSubmit={place} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-gradient-card border p-6 space-y-3">
            <h2 className="font-semibold mb-2">Shipping</h2>
            <Input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
            <Input required placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} className="h-11" />
            <Input required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="h-11" />
          </div>
          <div className="rounded-2xl bg-gradient-card border p-6 space-y-3">
            <h2 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="size-4 text-accent" /> Payment</h2>
            <Input placeholder="Card number" className="h-11" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="MM/YY" className="h-11" />
              <Input placeholder="CVC" className="h-11" />
            </div>
            <p className="text-xs text-muted-foreground">Demo only — no real payment processed.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-card border ai-border p-6 h-fit space-y-3">
          <h2 className="font-semibold">Order summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex gap-2">
            <Input placeholder="Coupon (try AI10)" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="h-9" />
          </div>
          {discount > 0 && <div className="flex justify-between text-sm text-accent"><span><Sparkles className="size-3 inline" /> AI10 applied</span><span>-${discount.toFixed(2)}</span></div>}
          <div className="flex justify-between font-bold pt-2 border-t"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <Button type="submit" disabled={placing} className="w-full h-11 bg-gradient-primary text-primary-foreground glow">
            {placing ? "Placing…" : "Place order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
