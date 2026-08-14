import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, ShieldCheck, Sparkles, Star, Truck, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProductCard, type Product } from "@/components/app/ProductCard";
import { toast } from "sonner";
import { formatPrice, normalizeCurrency } from "@/lib/currency";
import { useCurrency } from "@/contexts/CurrencyContext";

export const Route = createFileRoute("/_authenticated/product/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Smart Kart AI` }] }),
  component: PDP,
});

function PDP() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { currency: preferred } = useCurrency();

  const { data: product } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await supabase.from("products").select("*").eq("slug", slug).maybeSingle()).data as any,
  });
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data: similar } = useQuery({
    queryKey: ["similar", product?.category_id],
    enabled: !!product?.category_id,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("category_id", product.category_id).neq("id", product.id).limit(4);
      return data as Product[];
    },
  });

  useEffect(() => {
    if (product && user) {
      supabase.from("recently_viewed").upsert({ user_id: user.id, product_id: product.id, viewed_at: new Date().toISOString() }, { onConflict: "user_id,product_id" }).then(() => {});
    }
  }, [product, user]);

  if (product === undefined) return <div className="mx-auto max-w-7xl px-4 py-12 text-muted-foreground">Loading…</div>;
  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-muted-foreground mb-6">This product may have been removed or unpublished.</p>
        <Link to="/home"><Button className="bg-gradient-primary text-primary-foreground">Back to shopping</Button></Link>
      </div>
    );
  }

  const gallery: string[] = [product.image_url, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean);
  const mainImage = activeImage ?? gallery[0] ?? null;
  const inStock = (product.stock ?? 0) > 0 && product.status !== "inactive";
  const productCurrency = normalizeCurrency(product.currency, "USD");

  const addToCart = async () => {
    if (!user) return;
    const { error } = await supabase.from("cart_items").upsert({ user_id: user.id, product_id: product.id, quantity: 1 }, { onConflict: "user_id,product_id" });
    if (error) toast.error(error.message); else { toast.success("Added to cart"); qc.invalidateQueries({ queryKey: ["cart"] }); }
  };
  const addToWishlist = async () => {
    if (!user) return;
    const { error } = await supabase.from("wishlist").upsert({ user_id: user.id, product_id: product.id }, { onConflict: "user_id,product_id" });
    if (error) toast.error(error.message); else toast.success("Saved to wishlist");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="rounded-3xl overflow-hidden bg-gradient-card border aspect-square">
            {mainImage && <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {gallery.map((src) => (
                <button key={src} onClick={() => setActiveImage(src)}
                  className={`size-16 rounded-xl overflow-hidden border shrink-0 ${src === mainImage ? "border-primary" : ""}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="text-xs uppercase tracking-widest text-accent flex items-center gap-1"><Sparkles className="size-3" /> AI verified</div>
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
          {product.brand && <div className="text-sm text-muted-foreground -mt-3">by {product.brand}</div>}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-accent text-accent" />
              <span className="font-medium">{product.rating?.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.review_count} reviews)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="size-3" /> AI Trust {product.ai_trust_score}
            </span>
          </div>
          <p className="text-muted-foreground">{product.description}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price, productCurrency)}</span>
            {product.compare_at_price && (
              <span className="text-lg line-through text-muted-foreground">
                {formatPrice(product.compare_at_price, productCurrency)}
              </span>
            )}
          </div>
          {productCurrency !== preferred && (
            <div className="text-xs text-muted-foreground -mt-3">
              Listed by the seller in {productCurrency}. Conversion to {preferred} isn't available yet — you'll be charged in {productCurrency}.
            </div>
          )}
          <div className={`text-sm ${inStock ? "text-accent" : "text-destructive"}`}>
            {inStock ? `In stock · ${product.stock} available` : "Currently unavailable"}
          </div>

          <div className="flex gap-2">
            <Button onClick={addToCart} disabled={!inStock} className="flex-1 h-12 bg-gradient-primary text-primary-foreground glow">
              <ShoppingCart className="size-4" /> {inStock ? "Add to cart" : "Unavailable"}
            </Button>
            <Button onClick={addToWishlist} variant="outline" size="icon" className="size-12 glass">
              <Heart className="size-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="size-4 text-accent" /> Free delivery · estimated 2–4 days
          </div>

          {Array.isArray(product.features) && product.features.length > 0 && (
            <div className="rounded-2xl bg-gradient-card border p-5">
              <div className="text-sm font-semibold mb-2">Key features</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {product.features.map((f: string, i: number) => <li key={i}>· {f}</li>)}
              </ul>
            </div>
          )}

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="rounded-2xl bg-gradient-card border p-5">
              <div className="text-sm font-semibold mb-3">Specifications</div>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {Object.entries(product.specifications as Record<string, string>).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-border/40 py-1">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* AI Review Summary */}
          <div className="rounded-2xl glass ai-border p-5 mt-4">
            <div className="text-xs uppercase tracking-widest text-accent mb-2 flex items-center gap-1">
              <Sparkles className="size-3" /> AI Review Summary
            </div>
            <p className="text-sm mb-4">{product.ai_summary}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-accent mb-2 flex items-center gap-1"><Check className="size-3" /> Pros</div>
                <ul className="space-y-1 text-sm">
                  {(product.ai_pros ?? []).map((p: string, i: number) => <li key={i}>· {p}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1"><X className="size-3" /> Cons</div>
                <ul className="space-y-1 text-sm">
                  {(product.ai_cons ?? []).map((p: string, i: number) => <li key={i}>· {p}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {similar && similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-4">Similar products picked by AI</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
