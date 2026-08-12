import { z } from "zod";

export const shippingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(240),
  city: z.string().trim().min(1).max(120),
});

const COUPONS: Record<string, number> = { AI10: 0.1 };

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeOrderTotals(
  cart: { quantity: number; product: { id: string; price: number } | null }[],
  coupon: string,
) {
  const lines = cart
    .filter((c) => c.product && Number.isFinite(Number(c.product.price)))
    .map((c) => ({
      productId: c.product!.id,
      quantity: Math.max(1, Math.min(99, Math.floor(Number(c.quantity) || 1))),
      price: round2(Number(c.product!.price)),
    }));

  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const rate = COUPONS[coupon.trim().toUpperCase()] ?? 0;
  const discount = round2(subtotal * rate);
  const total = round2(subtotal - discount);
  return { lines, subtotal, discount, total };
}
