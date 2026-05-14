import OpenAI from "openai";

let _client: OpenAI | undefined;
export function openai() {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
export const DEFAULT_TEMPERATURE = Number(process.env.OPENAI_TEMPERATURE ?? 0.7);
export const DEFAULT_MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS ?? 1000);

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export async function chatJSON<T = unknown>(opts: {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ data: T; tokensIn?: number; tokensOut?: number; model: string }> {
  const model = opts.model ?? DEFAULT_MODEL;
  const res = await openai().chat.completions.create({
    model,
    temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  });
  const text = res.choices[0]?.message?.content ?? "{}";
  let parsed: T;
  try {
    parsed = JSON.parse(text) as T;
  } catch {
    throw new Error("AI returned invalid JSON");
  }
  return {
    data: parsed,
    tokensIn: res.usage?.prompt_tokens,
    tokensOut: res.usage?.completion_tokens,
    model,
  };
}
