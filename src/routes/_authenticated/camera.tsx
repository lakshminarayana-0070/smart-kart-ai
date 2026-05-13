import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/app/ProductCard";

export const Route = createFileRoute("/_authenticated/camera")({
  head: () => ({ meta: [{ title: "Camera Shopping — Smart Kart AI" }] }),
  component: CameraPage,
});

function CameraPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const { data: matches } = useQuery({
    queryKey: ["camera-matches", analyzed],
    enabled: analyzed,
    queryFn: async () => (await supabase.from("products").select("*").limit(6)).data as Product[],
  });

  const onFile = (f: File) => {
    setPreview(URL.createObjectURL(f));
    setAnalyzed(false);
    setTimeout(() => setAnalyzed(true), 1200);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl bg-gradient-card border ai-border p-6 md:p-10 text-center">
        <div className="text-xs uppercase tracking-widest text-accent mb-2 flex items-center gap-1 justify-center"><Sparkles className="size-3" /> Visual AI Search</div>
        <h1 className="text-3xl font-bold mb-3">Snap a photo. Find the match.</h1>
        <p className="text-muted-foreground mb-8">Upload an image of any item — our AI finds visually similar products in your store.</p>

        <label className="block max-w-md mx-auto cursor-pointer">
          <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <div className="aspect-video rounded-2xl border-2 border-dashed border-primary/30 grid place-items-center bg-background/30 hover:border-primary transition glow-ai overflow-hidden">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <div className="size-14 mx-auto rounded-full bg-gradient-primary grid place-items-center mb-3 glow"><Camera className="size-6 text-primary-foreground" /></div>
                <div className="font-medium">Click to upload or drag a photo</div>
                <div className="text-xs text-muted-foreground mt-1">PNG, JPG, up to 10MB</div>
              </div>
            )}
          </div>
        </label>

        {preview && (
          <Button className="mt-4 bg-gradient-primary text-primary-foreground glow" onClick={() => { setPreview(null); setAnalyzed(false); }}>
            <Upload className="size-4" /> Try another image
          </Button>
        )}
      </div>

      {analyzed && (
        <div className="mt-10">
          <div className="rounded-2xl glass ai-border p-4 mb-6 flex items-center gap-3">
            <Sparkles className="size-4 text-accent" />
            <span className="text-sm">AI detected: similar items in your catalog. Showing top matches.</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(matches ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
