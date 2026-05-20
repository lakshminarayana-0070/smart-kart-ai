/**
 * Server-only helper: embed a query and run pgvector similarity search
 * against smart_kart_ai_knowledge. RLS scopes results to the caller.
 * Never throws — failures return an empty result with an `error` field.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "@/lib/ai/embeddings.server";
import type { RetrievedMemory } from "@/lib/ai/rag-prompt";

export type MemoryRetrieval = {
  results: RetrievedMemory[];
  count: number;
  query: string;
  error?: string;
};

export async function retrieveMemoryForUser(
  supabase: SupabaseClient,
  query: string,
  opts: { matchCount?: number; matchThreshold?: number } = {},
): Promise<MemoryRetrieval> {
  const trimmed = query.trim();
  if (!trimmed) return { results: [], count: 0, query: trimmed };
  try {
    const { embedding } = await generateEmbedding(trimmed, "RETRIEVAL_QUERY");
    const literal = `[${embedding.join(",")}]`;
    const { data, error } = await supabase.rpc("match_memory", {
      query_embedding: literal as unknown as string,
      match_threshold: opts.matchThreshold ?? 0.5,
      match_count: opts.matchCount ?? 5,
    });
    if (error) {
      console.warn("[RAG] match_memory rpc error:", error.message);
      return { results: [], count: 0, query: trimmed, error: error.message };
    }
    const results = (data ?? []) as RetrievedMemory[];
    return { results, count: results.length, query: trimmed };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[RAG] retrieval failed:", msg);
    return { results: [], count: 0, query: trimmed, error: msg };
  }
}