import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getMyProductFn, updateProductFn } from "@/lib/products.functions";
import { ProductForm, emptyProduct, type ProductFormValues } from "@/components/seller/ProductForm";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/seller/products/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit product — Smart Kart AI" },
      { name: "description", content: "Update pricing, stock, images, category and specifications for your Smart Kart AI product." },
      { property: "og:title", content: "Edit product — Smart Kart AI" },
      { property: "og:description", content: "Update your Smart Kart AI product listing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const getProduct = useServerFn(getMyProductFn);
  const update = useServerFn(updateProductFn);
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-product", id],
    queryFn: () => getProduct({ data: { id } }),
    retry: false,
  });

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground"><Loader2 className="size-5 animate-spin mx-auto" /></div>;
  }
  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-muted-foreground">{(error as Error)?.message ?? "You can only edit products you own."}</p>
      </div>
    );
  }

  const p = data as any;
  const initial: ProductFormValues = {
    ...emptyProduct,
    name: p.name ?? "",
    brand: p.brand ?? "",
    sku: p.sku ?? "",
    description: p.description ?? "",
    category_id: p.category_id ?? "",
    subcategory_id: p.subcategory_id ?? null,
    tags: Array.isArray(p.tags) ? p.tags : [],
    features: Array.isArray(p.features) ? p.features : [],
    specifications: p.specifications && typeof p.specifications === "object" ? p.specifications : {},
    price: Number(p.price ?? 0),
    compare_at_price: p.compare_at_price == null ? null : Number(p.compare_at_price),
    currency: p.currency ?? "USD",
    stock: Number(p.stock ?? 0),
    image_url: p.image_url ?? null,
    images: Array.isArray(p.images) ? p.images : [],
    status: p.status ?? "active",
  };

  const submit = async (values: ProductFormValues) => {
    setSaving(true);
    try {
      await update({ data: { id, values } });
      toast.success("Product updated");
      nav({ to: "/seller/products" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save the product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit product</h1>
      <ProductForm initial={initial} submitLabel="Save changes" saving={saving} onSubmit={submit} />
    </div>
  );
}