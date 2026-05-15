// Lovable AI Gateway client (replaces OpenAI SDK).
// Keeps the filename for backwards compatibility with existing imports.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const DEFAULT_MODEL = process.env.AI_MODEL || "google/gemini-3-flash-preview";
export const DEFAULT_TEMPERATURE = Number(process.env.AI_TEMPERATURE ?? 0.7);
export const DEFAULT_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? 1000);

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

function getApiKey() {
  const k = process.env.LOVABLE_API_KEY;
  if (!k) throw new Error("LOVABLE_API_KEY is not configured");
  return k;
}

export class AIGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function gatewayFetch(body: Record<string, unknown>, signal?: AbortSignal) {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    if (res.status === 429) throw new AIGatewayError(429, "AI rate limit exceeded. Please try again in a moment.");
    if (res.status === 402) throw new AIGatewayError(402, "AI credits exhausted for this workspace. Add credits in Settings → Workspace → Usage.");
    const t = await res.text().catch(() => "");
    throw new AIGatewayError(res.status, `AI gateway error (${res.status}): ${t || res.statusText}`);
  }
  return res;
}

export async function chatJSON<T = unknown>(opts: {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ data: T; tokensIn?: number; tokensOut?: number; model: string }> {
  const model = opts.model ?? DEFAULT_MODEL;
  const res = await gatewayFetch({
    model,
    temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: opts.system + "\n\nReturn ONLY valid JSON. No markdown, no commentary." },
      { role: "user", content: opts.user },
    ],
  });
  const json = await res.json();
  let text: string = json?.choices?.[0]?.message?.content ?? "{}";
  // Strip markdown code fences if a model included them anyway.
  text = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  let parsed: T;
  try {
    parsed = JSON.parse(text) as T;
  } catch {
    throw new Error("AI returned invalid JSON");
  }
  return {
    data: parsed,
    tokensIn: json?.usage?.prompt_tokens,
    tokensOut: json?.usage?.completion_tokens,
    model,
  };
}

/** Streaming chat completions through the Lovable AI Gateway. Returns the raw fetch Response (SSE body). */
export async function chatStream(opts: {
  messages: ChatMsg[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}) {
  return gatewayFetch(
    {
      model: opts.model ?? DEFAULT_MODEL,
      temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
      max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
      stream: true,
      messages: opts.messages,
    },
    opts.signal,
  );
}
