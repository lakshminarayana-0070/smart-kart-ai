import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateEmbedding } from "@/lib/ai/embeddings.server";

export const listMemoryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("smart_kart_ai_knowledge")
      .select("id, knowledge_name, category, title, content, keywords, business_name, embedding_model, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { entries: data ?? [] };
  });

const deleteSchema = z.object({ id: z.string().uuid() });

export const deleteMemoryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("smart_kart_ai_knowledge")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { success: true as const };
  });

const searchSchema = z.object({
  query: z.string().min(1).max(2000),
  match_count: z.number().min(1).max(20).default(5),
  match_threshold: z.number().min(0).max(1).default(0.5),
});

export type MemorySearchResult = {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string[] | null;
  similarity: number;
};

/**
 * Semantic similarity search over the user's AI memory.
 * Uses RETRIEVAL_QUERY task type so query embeddings live in the
 * correct vector space relative to stored RETRIEVAL_DOCUMENT vectors.
 * RLS automatically scopes results to auth.uid().
 */
export const searchMemoryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => searchSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { embedding, dimension } = await generateEmbedding(
      data.query,
      "RETRIEVAL_QUERY",
    );
    const embeddingLiteral = `[${embedding.join(",")}]`;

    const { data: rows, error } = await supabase.rpc("match_memory", {
      query_embedding: embeddingLiteral as unknown as string,
      match_threshold: data.match_threshold,
      match_count: data.match_count,
    });

    if (error) {
      console.error("[searchMemoryFn] rpc error:", error);
      throw new Error(error.message);
    }

    const results = (rows ?? []) as MemorySearchResult[];
    return {
      results,
      query_used: data.query,
      count: results.length,
      embedding_dimension: dimension,
      threshold: data.match_threshold,
    };
  });