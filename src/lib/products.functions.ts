import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { productInputSchema, slugify } from "@/lib/products.schema";

const SELECT = "*";

/** Products owned by the signed-in seller (includes drafts/inactive). */
export const listMyProductsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products")
      .select(SELECT)
      .eq("seller_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load your products");
    return data ?? [];
  });

export const getMyProductFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("products")
      .select(SELECT)
      .eq("id", data.id)
      .eq("seller_id", context.userId)
      .maybeSingle();
    if (error) throw new Error("Could not load the product");
    if (!row) throw new Error("Product not found");
    return row;
  });

export const createProductFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => productInputSchema.parse(i))
  .handler(async ({ data, context }) => {
    const slug = `${slugify(data.name)}-${Math.random().toString(36).slice(2, 7)}`;
    const { data: row, error } = await context.supabase
      .from("products")
      .insert({
        ...data,
        brand: data.brand || null,
        sku: data.sku || null,
        description: data.description || null,
        slug,
        seller_id: context.userId,
      })
      .select("id, slug")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Could not save the product");
    return row;
  });

export const updateProductFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), values: productInputSchema }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("products")
      .update({
        ...data.values,
        brand: data.values.brand || null,
        sku: data.values.sku || null,
        description: data.values.description || null,
      })
      .eq("id", data.id)
      .eq("seller_id", context.userId)
      .select("id, slug")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Product not found or you do not own it");
    return row;
  });

/** Safe deactivate / publish — never hard-deletes, so orders and reviews stay intact. */
export const setProductStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ id: z.string().uuid(), status: z.enum(["active", "draft", "inactive"]) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("products")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("seller_id", context.userId)
      .select("id, status")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Product not found or you do not own it");
    return row;
  });