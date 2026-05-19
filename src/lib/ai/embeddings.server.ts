/**
 * We call Gemini API directly because Lovable AI Gateway
 * does not currently expose an embeddings endpoint.
 * We keep using Lovable AI for chat/generation
 * throughout the rest of the Smart Kart AI app.
 *
 * This module is SERVER-ONLY. The `.server.ts` suffix prevents
 * any import from leaking into the client bundle.
 */

const PRIMARY_MODEL = "text-embedding-004";
const FALLBACK_MODEL = "gemini-embedding-001";
const DIMENSION = 768;

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

export type EmbeddingResult = {
  embedding: number[];
  model: string;
  dimension: number;
};

type GeminiEmbedResponse = {
  embedding?: { values?: number[] };
  error?: { code?: number; message?: string; status?: string };
};

async function callGemini(
  model: string,
  text: string,
  taskType: EmbeddingTaskType,
  apiKey: string,
): Promise<{ ok: true; values: number[] } | { ok: false; status: number; message: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: DIMENSION,
    }),
  });

  let body: GeminiEmbedResponse | null = null;
  try { body = (await res.json()) as GeminiEmbedResponse; } catch { /* ignore */ }

  if (!res.ok) {
    const message = body?.error?.message ?? `HTTP ${res.status}`;
    return { ok: false, status: res.status, message };
  }

  const values = body?.embedding?.values;
  if (!Array.isArray(values)) {
    return { ok: false, status: 500, message: "Embedding missing from response" };
  }
  return { ok: true, values };
}

function isFallbackable(status: number, message: string): boolean {
  if (status === 404) return true;
  const m = message.toLowerCase();
  return m.includes("not found") || m.includes("unsupported") || m.includes("not supported");
}

function mapStatusToError(status: number, fallbackMessage: string): Error {
  switch (status) {
    case 400: return new Error("Invalid input for embedding");
    case 403: return new Error("API key invalid");
    case 404: return new Error("Model not available, falling back automatically");
    case 429: return new Error("Rate limit hit, try again shortly");
    default:  return new Error(fallbackMessage || `Embedding request failed (${status})`);
  }
}

export async function generateEmbedding(
  text: string,
  taskType: EmbeddingTaskType = "RETRIEVAL_DOCUMENT",
): Promise<EmbeddingResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Embedding service not configured");
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Invalid input for embedding");
  }

  // Try primary model first.
  let attempt = await callGemini(PRIMARY_MODEL, text, taskType, apiKey);
  let usedModel = PRIMARY_MODEL;

  if (!attempt.ok && isFallbackable(attempt.status, attempt.message)) {
    console.log("[Embeddings] Primary model unavailable, falling back to:", FALLBACK_MODEL);
    attempt = await callGemini(FALLBACK_MODEL, text, taskType, apiKey);
    usedModel = FALLBACK_MODEL;
  }

  if (!attempt.ok) {
    throw mapStatusToError(attempt.status, attempt.message);
  }

  const values = attempt.values;
  if (!values.every((n) => typeof n === "number" && Number.isFinite(n))) {
    throw new Error("Embedding contains invalid values");
  }
  if (values.length !== DIMENSION) {
    throw new Error("Unexpected dimension count");
  }

  console.log("[Embeddings] Using model:", usedModel);

  return { embedding: values, model: usedModel, dimension: DIMENSION };
}