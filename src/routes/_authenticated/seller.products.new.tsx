import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createProductFn } from "@/lib/products.functions";
import { ProductForm, emptyProduct, type ProductFormValues } from "@/components/seller/ProductForm";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/seller/products/new")({
  head: () => ({
    meta: [
      { title: "Add a product — Smart Kart AI" },
      { name: "description", content: "List a new product with images, pricing, stock and specifications on Smart Kart AI." },
      { property: "og:title", content: "Add a product — Smart Kart AI" },
      { property: "og:description", content: "List a new product on Smart Kart AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewProduct,
});

function NewProduct() {
  const create = useServerFn(createProductFn);
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);

  const submit = async (values: ProductFormValues) => {
    setSaving(true);
    try {
      await create({ data: values });
      toast.success("Product created");
      nav({ to: "/seller/products" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save the product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add a product</h1>
      <ProductForm initial={emptyProduct} submitLabel="Publish product" saving={saving} onSubmit={submit} />
    </div>
  );
}