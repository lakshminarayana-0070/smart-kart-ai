import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/app/Navbar";
import { Footer } from "@/components/app/Footer";
import { Button } from "@/components/ui/button";
import { Sparkles, Camera, Wallet, Search, Brain, ShieldCheck, Zap, ArrowRight, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/app/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Kart AI — AI-First Shopping Reimagined" },
      { name: "description", content: "A futuristic AI commerce platform. Personalized recommendations, camera search, and budget intelligence." },
      { property: "og:title", content: "Smart Kart AI" },
      { property: "og:description", content: "AI-first shopping with smart recommendations and camera search." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { data: trending } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_trending", true).limit(8);
      return (data ?? []) as Product[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60"
          style={{ background: "radial-gradient(ellipse at center, oklch(0.30 0.18 295 / 0.5), transparent 60%)" }} />
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-widest mb-8">
            <Sparkles className="size-3.5 text-accent" />
            Now powered by next-gen AI
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-[1.05]">
            Shopping that <span className="text-gradient">thinks</span><br className="hidden sm:block" />
            with you.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Smart Kart AI is your personal AI shopping companion. Discover products by photo, budget, or natural language — with reviews summarized for you instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground glow h-12 px-8">
                Start shopping with AI <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/home">
              <Button size="lg" variant="outline" className="h-12 px-8 glass">
                Browse store
              </Button>
            </Link>
          </div>

          {/* Floating AI cards */}
          <div className="mt-20 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Camera, label: "Snap to find", sub: "Visual AI search" },
              { icon: Wallet, label: "Set your budget", sub: "AI builds bundles" },
              { icon: Brain, label: "Reviews, distilled", sub: "Trust score in 1 sec" },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-5 ai-border animate-pulse-glow text-left">
                <f.icon className="size-5 text-accent mb-3" />
                <div className="font-semibold">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-widest text-accent mb-2">The Smart Kart AI difference</div>
          <h2 className="text-4xl font-bold">Five AI superpowers, one storefront.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: Sparkles, title: "AI Recommendations", text: "Feeds tuned to how you actually shop." },
            { icon: Camera, title: "Camera Shopping", text: "Snap any item, find lookalikes instantly." },
            { icon: Search, title: "Smart Search", text: "Natural language and semantic search." },
            { icon: ShieldCheck, title: "Review Intelligence", text: "Summaries, sentiment, trust scores." },
            { icon: Wallet, title: "Budget Assistant", text: "Tell us your budget — we build the cart." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-6 bg-gradient-card border hover:border-primary/40 transition group">
              <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center mb-4 group-hover:glow transition">
                <f.icon className="size-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-accent mb-2">How it works</div>
            <h2 className="text-4xl font-bold mb-6">Less browsing.<br />More discovery.</h2>
            <div className="space-y-5">
              {[
                ["Tell the AI what you want", "Type, speak, or upload a photo."],
                ["AI personalizes everything", "Recommendations adapt to your style and budget."],
                ["Decide with confidence", "Review summaries, pros & cons, AI trust scores."],
              ].map(([t, s], i) => (
                <div key={i} className="flex gap-4">
                  <div className="size-8 shrink-0 rounded-full bg-gradient-primary grid place-items-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{t}</div>
                    <div className="text-sm text-muted-foreground">{s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square rounded-3xl bg-gradient-card border ai-border overflow-hidden">
            <div className="absolute inset-0 grid place-items-center">
              <div className="size-48 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <Brain className="size-32 text-primary opacity-90" />
            </div>
            <div className="absolute bottom-6 left-6 right-6 glass rounded-xl p-4">
              <div className="text-xs text-accent uppercase tracking-widest mb-1 flex items-center gap-1">
                <Zap className="size-3" /> AI Insight
              </div>
              <div className="text-sm">"Based on your style — slim, monochrome — try the Aether Hoodie + Drift Runners combo."</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending && trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-accent mb-2">Trending now</div>
              <h2 className="text-3xl font-bold">What the AI is loving</h2>
            </div>
            <Link to="/home" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Loved by smart shoppers.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ["Maya R.", "The camera search is wild — found the exact lamp from a café photo."],
            ["Jordan K.", "Budget mode built me a $200 home gym setup. 10/10."],
            ["Priya S.", "I trust the AI review scores more than star ratings now."],
          ].map(([n, t], i) => (
            <div key={i} className="rounded-2xl p-6 bg-gradient-card border">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="size-4 fill-accent text-accent" />)}
              </div>
              <p className="text-sm mb-4">"{t}"</p>
              <div className="text-xs text-muted-foreground">{n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="rounded-3xl glass ai-border p-12">
          <h2 className="text-4xl font-bold mb-3">Ready to shop with AI?</h2>
          <p className="text-muted-foreground mb-8">Sign up free and unlock your personalized AI storefront.</p>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground glow h-12 px-8">
              Create free account <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
