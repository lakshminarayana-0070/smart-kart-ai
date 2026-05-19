import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateEmbedding } from "@/lib/ai/embeddings.server";
import type { Database } from "@/integrations/supabase/types";

type KnowledgeCategory = Database["public"]["Enums"]["smart_kart_knowledge_category"];

const ALLOWED_CATEGORIES: readonly KnowledgeCategory[] = [
  "shopping_preferences",
  "budget_rules",
  "favorite_brands",
  "product_interests",
  "purchase_history",
  "wishlist",
  "seller_business_info",
  "marketing_style",
  "customer_support_rules",
  "product_catalog_notes",
  "review_insights",
  "custom_ai_instructions",
] as const;

const categorySchema = z.enum(ALLOWED_CATEGORIES as unknown as [KnowledgeCategory, ...KnowledgeCategory[]], {
  errorMap: () => ({ message: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(", ")}` }),
});

const embedInputSchema = z.object({
  text: z.string().min(1, "Text required").max(8000, "Text too long (max 8000 chars)"),
  taskType: z.enum(["RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY"]).optional(),
});

const embedAndSaveSchema = z.object({
  knowledge_name: z.string().min(1).max(200),
  category: categorySchema,
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(8000),
  keywords: z.array(z.string().min(1).max(60)).max(50).optional(),
  business_name: z.string().min(1).max(200).optional(),
});

/**
 * Generate an embedding for an arbitrary piece of text.
 * Useful for query-side semantic search (use taskType "RETRIEVAL_QUERY").
 */
export const generateEmbeddingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => embedInputSchema.parse(input))
  .handler(async ({ data }) => {
    return await generateEmbedding(data.text, data.taskType ?? "RETRIEVAL_DOCUMENT");
  });

/**
 * Embed knowledge content and persist it for the authenticated user.
 * RLS automatically scopes user_id via the auth middleware.
 */
export const embedAndSaveFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => embedAndSaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { embedding, model, dimension } = await generateEmbedding(
      data.content,
      "RETRIEVAL_DOCUMENT",
    );

    // pgvector accepts the literal "[v1,v2,...]" string form via supabase-js
    const embeddingLiteral = `[${embedding.join(",")}]`;

    const { data: row, error } = await supabase
      .from("smart_kart_ai_knowledge")
      .insert({
        user_id: userId,
        knowledge_name: data.knowledge_name,
        category: data.category,
        title: data.title,
        content: data.content,
        keywords: data.keywords ?? [],
        business_name: data.business_name ?? "Smart Kart AI",
        embedding: embeddingLiteral as unknown as string,
        embedding_model: model,
        embedding_dimension: dimension,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[embedAndSaveFn] insert error:", error);
      throw new Error(error.message);
    }

    return {
      id: row.id,
      success: true as const,
      message: "Knowledge embedded and saved successfully",
    };
  });