import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { chatJSON } from "./openai.server";
import { PROMPTS } from "./prompts";
import { retrieveMemoryForUser } from "@/lib/ai/rag-retrieve.server";
import {
  buildRagPrompt,
  buildSearchQuery,
  formatRetrievedContext,
  isRagEnabled,
} from "@/lib/ai/rag-prompt";

async function logGeneration(supabase: any, userId: string, kind: string, input: any, output: any, model: string, tokensIn?: number, tokensOut?: number) {
  await supabase.from("ai_generations").insert({
    user_id: userId, kind, input, output, model, tokens_in: tokensIn, tokens_out: tokensOut,
  });
}

/* ========== Product Description ========== */
const descSchema = z.object({
  title: z.string().min(1).max(200),
  brand: z.string().max(100).optional().default(""),
  category: z.string().max(100).optional().default(""),
  features: z.string().max(2000).optional().default(""),
});
export const generateDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => descSchema.parse(d))
  .handler(async ({ data, context }) => {
    const user = `Product: ${data.title}\nBrand: ${data.brand}\nCategory: ${data.category}\nFeatures: ${data.features}\n\nReturn JSON: { "short": string (≤160 chars), "long": string (2-3 paragraphs), "bullets": string[] (5 SEO-friendly highlights), "seo_keywords": string[] (8 lowercase keywords) }`;
    const { data: out, tokensIn, tokensOut, model } = await chatJSON<{ short: string; long: string; bullets: string[]; seo_keywords: string[] }>({
      system: PROMPTS.productDescription, user,
    });
    await logGeneration(context.supabase, context.userId, "description", data, out, model, tokensIn, tokensOut);
    return out;
  });

/* ========== Review Analyzer ========== */
const reviewSchema = z.object({
  reviews: z.array(z.string().min(1).max(2000)).min(1).max(50),
});
export const analyzeReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => reviewSchema.parse(d))
  .handler(async ({ data, context }) => {
    const user = `Reviews:\n${data.reviews.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\nReturn JSON: { "positive_summary": string, "negative_summary": string, "common_praises": string[], "common_complaints": string[], "sentiment": "positive"|"mixed"|"negative", "sentiment_score": number (0-100), "fake_review_indices": number[] (1-based indices likely fake), "ai_confidence": number (0-100) }`;
    const { data: out, tokensIn, tokensOut, model } = await chatJSON<any>({
      system: PROMPTS.reviewAnalyzer, user, maxTokens: 1500,
    });
    await logGeneration(context.supabase, context.userId, "review_analysis", { count: data.reviews.length }, out, model, tokensIn, tokensOut);
    return out;
  });

/* ========== Customer Reply ========== */
const replySchema = z.object({
  message: z.string().min(1).max(3000),
  context: z.string().max(1000).optional().default(""),
  tone: z.enum(["friendly", "professional", "premium", "concise", "empathetic"]).default("professional"),
});
export const generateReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => replySchema.parse(d))
  .handler(async ({ data, context }) => {
    const user = `Tone: ${data.tone}\nOrder/context: ${data.context || "(none)"}\n\nCustomer message:\n"""${data.message}"""\n\nReturn JSON: { "reply": string, "subject": string }`;
    const { data: out, tokensIn, tokensOut, model } = await chatJSON<{ reply: string; subject: string }>({
      system: PROMPTS.customerReply, user,
    });
    await logGeneration(context.supabase, context.userId, "customer_reply", data, out, model, tokensIn, tokensOut);
    return out;
  });

/* ========== Marketing ========== */
const marketingSchema = z.object({
  product: z.string().min(1).max(300),
  audience: z.string().max(300).optional().default(""),
  tone: z.enum(["bold", "playful", "premium", "friendly", "urgent"]).default("bold"),
});
export const generateMarketing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => marketingSchema.parse(d))
  .handler(async ({ data, context }) => {
    const userInputs = `Product: ${data.product}\nAudience: ${data.audience || "general"}\nTone: ${data.tone}\n\nReturn JSON: { "headlines": string[] (5, ≤60 chars each), "ad_copy": string[] (3 short ad bodies), "instagram_caption": string, "facebook_ad": string, "email_subject": string, "email_body": string, "push_notification": string (≤80 chars), "seo_keywords": string[] (8) }`;

    // RAG enrichment (enhancement-only — must never block generation).
    let userMessage = userInputs;
    let ragMatches: Awaited<ReturnType<typeof retrieveMemoryForUser>>["results"] = [];
    let ragFallback = false;
    let ragQuery: string | undefined;

    if (isRagEnabled("marketing-generator")) {
      ragQuery = buildSearchQuery("marketing generator", {
        product: data.product,
        audience: data.audience,
        tone: data.tone,
      });
      const retrieval = await retrieveMemoryForUser(context.supabase, ragQuery, {
        matchCount: 5,
        matchThreshold: 0.5,
      });
      ragMatches = retrieval.results;
      ragFallback = !!retrieval.error;
      const formatted = formatRetrievedContext(ragMatches);
      userMessage = buildRagPrompt({
        userInputs,
        formattedContext: formatted,
      });
      console.log(
        `[RAG] Query: ${ragQuery} | Matches: ${ragMatches.length} | Generation Mode: ${formatted ? "RAG" : "plain"} | Fallback Used: ${ragFallback}`,
      );
    }

    const { data: out, tokensIn, tokensOut, model } = await chatJSON<any>({
      system: PROMPTS.marketing, user: userMessage, maxTokens: 1800,
    });
    await logGeneration(context.supabase, context.userId, "marketing", data, out, model, tokensIn, tokensOut);
    // Additive `_rag` field — existing UI/parsing keeps working.
    return {
      ...out,
      _rag: {
        used: ragMatches.length > 0,
        count: ragMatches.length,
        query: ragQuery ?? null,
        fallback: ragFallback,
        matches: ragMatches.map((m) => ({
          id: m.id,
          title: m.title,
          category: m.category,
          similarity: m.similarity,
          content: m.content.slice(0, 280),
        })),
      },
    };
  });

/* ========== Chat history ========== */
export const listChats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("ai_chats").select("id,title,updated_at").order("updated_at", { ascending: false }).limit(30);
    return (data ?? []) as { id: string; title: string; updated_at: string }[];
  });

export const getChatMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ chatId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: msgs } = await context.supabase
      .from("ai_messages")
      .select("id,role,content,created_at")
      .eq("chat_id", data.chatId)
      .order("created_at", { ascending: true });
    return (msgs ?? []) as { id: string; role: "user" | "assistant" | "system"; content: string; created_at: string }[];
  });
