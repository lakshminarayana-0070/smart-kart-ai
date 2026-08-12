import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeOrderTotals, shippingSchema } from "@/lib/checkout.server";

const placeOrderSchema = z.object({
  coupon: z.string().trim().max(32).optional().default(""),
  shipping: shippingSchema,
});

export const placeOrderFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => placeOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Read the caller's own cart with RLS applied, and join trusted product prices.
    const { data: cart, error: cartError } = await supabase
      .from("cart_items")
      .select("quantity, product:products(id, price)")
      .eq("user_id", userId);
    if (cartError) throw new Error("Could not load cart");
    if (!cart || cart.length === 0) throw new Error("Cart is empty");

    const { lines, subtotal, discount, total } = computeOrderTotals(
      cart as { quantity: number; product: { id: string; price: number } | null }[],
      data.coupon,
    );
    if (lines.length === 0) throw new Error("Cart is empty");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        total,
        status: "confirmed",
        shipping_address: data.shipping,
      })
      .select("id")
      .single();
    if (orderError || !order) throw new Error("Could not create order");

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.productId,
        quantity: l.quantity,
        price: l.price,
      })),
    );
    if (itemsError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("Could not create order");
    }

    await supabase.from("cart_items").delete().eq("user_id", userId);

    return { orderId: order.id as string, subtotal, discount, total };
  });
