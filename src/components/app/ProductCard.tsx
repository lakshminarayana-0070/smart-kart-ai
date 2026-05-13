import { Link } from "@tanstack/react-router";
import { Sparkles, Star } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  ai_trust_score?: number | null;
  is_trending?: boolean | null;
};

export function ProductCard({ p }: { p: Product }) {
  const off = p.compare_at_price ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0;
  return (
    <Link
      to="/product/$slug"
      params={{ slug: p.slug }}
      className="group relative rounded-2xl bg-gradient-card border overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1 hover:glow-ai"
    >
      <div className="aspect-square overflow-hidden bg-muted/30 relative">
        {p.image_url && (
          <img src={p.image_url} alt={p.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        {p.is_trending && (
          <div className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-primary text-primary-foreground flex items-center gap-1">
            <Sparkles className="size-3" /> Trending
          </div>
        )}
        {off > 0 && (
          <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full bg-accent text-accent-foreground">
            -{off}%
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-medium line-clamp-1 group-hover:text-primary transition">{p.name}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="size-3 fill-accent text-accent" />
          <span>{p.rating?.toFixed(1)}</span>
          <span>·</span>
          <span>{p.review_count} reviews</span>
          {p.ai_trust_score && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-semibold">
              AI {p.ai_trust_score}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">${p.price.toFixed(2)}</span>
          {p.compare_at_price && (
            <span className="text-xs line-through text-muted-foreground">${p.compare_at_price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
