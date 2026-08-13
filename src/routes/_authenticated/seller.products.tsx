import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyProductsFn, setProductStatusFn } from "@/lib/products.functions";
import { Button } from "@/components/ui/button";
import { Plus, Package, Pencil, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/seller/products")({
  head: () => ({
    meta: [
      { title: "Seller products — Smart Kart AI" },
      { name: "description", content: "Create, edit, publish and unpublish the products you sell on Smart Kart AI." },
      { property: "og:title", content: "Seller products — Smart Kart AI" },
      { property: "og:description", content: "Manage your Smart Kart AI product catalog." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SellerProducts,
});

function SellerProducts() {
  const list = useServerFn(listMyProductsFn);
  const setStatus = useServerFn(setProductStatusFn);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["my-products"],
    queryFn: () => list(),
  });

  const toggle = async (id: string, status: string) => {
    try {
      await setStatus({ data: { id, status: status === "active" ? "inactive" : "active" } });
      toast.success(status === "active" ? "Product unpublished" : "Product published");
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update the product");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold">Your products</h1>
          <p className="text-sm text-muted-foreground">Add, edit and publish the products you sell.</p>
        </div>
        <Link to="/seller/products/new">
          <Button className="bg-gradient-primary text-primary-foreground glow"><Plus className="size-4" /> Add product</Button>
        </Link>
      </div>

      {isLoading && <div className="rounded-2xl glass p-10 text-center text-muted-foreground"><Loader2 className="size-5 animate-spin mx-auto" /></div>}
      {error && <div className="rounded-2xl border border-destructive/40 p-6 text-sm text-destructive">{(error as Error).message}</div>}

      {data && data.length === 0 && (
        <div className="rounded-2xl glass p-12 text-center">
          <Package className="size-8 mx-auto mb-3 text-accent" />
          <p className="text-muted-foreground mb-4">You haven't listed any products yet.</p>
          <Link to="/seller/products/new"><Button className="bg-gradient-primary text-primary-foreground">Add your first product</Button></Link>
        </div>
      )}

      <div className="space-y-3">
        {(data ?? []).map((p: any) => (
          <div key={p.id} className="rounded-2xl bg-gradient-card border p-4 flex flex-wrap items-center gap-4">
            <div className="size-16 rounded-xl overflow-hidden bg-muted/30 shrink-0">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package className="size-5 m-auto mt-5 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-[160px]">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {p.brand ? `${p.brand} · ` : ""}{p.currency ?? "USD"} {Number(p.price).toFixed(2)} · stock {p.stock}
              </div>
            </div>
            <span className={`text-[11px] px-2 py-1 rounded-full ${p.status === "active" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
              {p.status === "active" ? "Published" : p.status}
            </span>
            <div className="flex items-center gap-2">
              <Link to="/seller/products/$id/edit" params={{ id: p.id }}>
                <Button size="sm" variant="outline"><Pencil className="size-3.5" /> Edit</Button>
              </Link>
              <Button size="sm" variant="ghost" disabled={isFetching} onClick={() => toggle(p.id, p.status)}>
                {p.status === "active" ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                {p.status === "active" ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}