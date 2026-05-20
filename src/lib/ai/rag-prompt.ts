/**
 * Shared RAG helpers for Smart Kart AI.
 * Pure functions — safe to import from server functions and client code.
 */

export type RetrievedMemory = {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string[] | null;
  similarity: number;
};

/** Feature ids opted-in to the RAG-enhanced generation flow. */
export const RAG_ENABLED_FEATURES = ["marketing-generator"] as const;
export type RagFeatureId = (typeof RAG_ENABLED_FEATURES)[number];

export function isRagEnabled(feature: string): feature is RagFeatureId {
  return (RAG_ENABLED_FEATURES as readonly string[]).includes(feature);
}

/**
 * Build a compact semantic-retrieval query from arbitrary feature inputs.
 * Empty / falsy fields are skipped, output is collapsed and trimmed.
 */
export function buildSearchQuery(
  feature: string,
  inputs: Record<string, unknown>,
): string {
  const parts: string[] = [feature.replace(/[-_]/g, " ")];
  for (const v of Object.values(inputs)) {
    if (typeof v === "string" && v.trim()) parts.push(v.trim());
    else if (Array.isArray(v)) parts.push(v.filter(Boolean).join(" "));
    else if (typeof v === "number") parts.push(String(v));
  }
  return parts.join(" · ").slice(0, 1000);
}

function prettyCategory(c: string): string {
  return c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/**
 * Format retrieved memories into the
 *   [Category · Title]
 *   Content
 * block, grouped by category and ordered by similarity DESC.
 */
export function formatRetrievedContext(
  memories: RetrievedMemory[],
  opts: { maxCharsPerEntry?: number } = {},
): string {
  if (!memories.length) return "";
  const maxChars = opts.maxCharsPerEntry ?? 600;
  const sorted = [...memories].sort((a, b) => b.similarity - a.similarity);
  const seen = new Set<string>();
  const blocks: string[] = [];
  for (const m of sorted) {
    const key = `${m.title}::${m.content.slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const content = m.content.length > maxChars
      ? `${m.content.slice(0, maxChars).trimEnd()}…`
      : m.content;
    blocks.push(`[${prettyCategory(m.category)} · ${m.title}]\n${content}`);
  }
  return blocks.join("\n\n");
}

/**
 * Build the final enriched Gemini-ready prompt.
 * When no context exists the AI still receives a clean instruction.
 */
export function buildRagPrompt(opts: {
  appName?: string;
  userInputs: string;
  formattedContext: string;
}): string {
  const app = opts.appName ?? "Smart Kart AI";
  const ctx = opts.formattedContext.trim() || "(no personal memory available)";
  return [
    `You are ${app}, an expert ecommerce AI assistant.`,
    "",
    "CONTEXT (retrieved from this user's memory):",
    ctx,
    "",
    "USER REQUEST:",
    opts.userInputs,
    "",
    "INSTRUCTIONS:",
    "- Use the CONTEXT to make the response feel personal to this user.",
    "- Stay consistent with the tone, audience, style, and policies in CONTEXT.",
    "- Never sound generic.",
    "- Never contradict the CONTEXT.",
    "- If CONTEXT is empty, still generate a high-quality helpful response.",
    "",
    "OUTPUT:",
  ].join("\n");
}