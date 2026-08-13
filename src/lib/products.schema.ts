import { z } from "zod";

export const PRODUCT_STATUSES = ["active", "draft", "inactive"] as const;

export const productInputSchema = z
  .object({
    name: z.string().trim().min(2, "Product name is required").max(160),
    brand: z.string().trim().max(80).optional().default(""),
    sku: z.string().trim().max(64).optional().default(""),
    description: z.string().trim().max(4000).optional().default(""),
    category_id: z.string().uuid("Choose a category"),
    subcategory_id: z.string().uuid().nullable().optional().default(null),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    features: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
    specifications: z.record(z.string(), z.string().max(300)).default({}),
    price: z.number().nonnegative("Price cannot be negative").max(10_000_000),
    compare_at_price: z.number().nonnegative().max(10_000_000).nullable().optional().default(null),
    currency: z.string().trim().length(3).default("USD"),
    stock: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative").max(1_000_000),
    image_url: z.string().url().nullable().optional().default(null),
    images: z.array(z.string().url()).max(8).default([]),
    status: z.enum(PRODUCT_STATUSES).default("active"),
  })
  .refine((v) => v.compare_at_price == null || v.compare_at_price >= v.price, {
    message: "Original price must be greater than or equal to the current price",
    path: ["compare_at_price"],
  });

export type ProductInput = z.infer<typeof productInputSchema>;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);