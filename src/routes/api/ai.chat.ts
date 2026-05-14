import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { openai, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "@/ai/openai.server";
import { PROMPTS } from "@/ai/prompts";
import { z } from "zod";

const bodySchema = z.object({
  chatId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
});

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const auth = request.headers.get("authorization");
          if (!auth?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
          const token = auth.slice(7);

          const SUPABASE_URL = process.env.SUPABASE_URL!;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
          const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
          });
          const { data: claims } = await supabase.auth.getClaims(token);
          const userId = claims?.claims?.sub;
          if (!userId) return new Response("Unauthorized", { status: 401 });

          const json = bodySchema.parse(await request.json());

          // Ensure chat
          let chatId = json.chatId;
          if (!chatId) {
            const { data: c, error } = await supabase
              .from("ai_chats")
              .insert({ user_id: userId, title: json.message.slice(0, 60) })
              .select("id")
              .single();
            if (error || !c) return new Response("Failed to create chat", { status: 500 });
            chatId = c.id;
          }

          // Load prior messages
          const { data: prior } = await supabase
            .from("ai_messages")
            .select("role,content")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true })
            .limit(40);

          // Persist user message
          await supabase.from("ai_messages").insert({
            chat_id: chatId, user_id: userId, role: "user", content: json.message,
          });

          const messages = [
            { role: "system" as const, content: PROMPTS.shoppingAssistant },
            ...((prior ?? []) as { role: "user" | "assistant" | "system"; content: string }[]).map((m) => ({ role: m.role, content: m.content })),
            { role: "user" as const, content: json.message },
          ];

          const stream = await openai().chat.completions.create({
            model: DEFAULT_MODEL,
            temperature: DEFAULT_TEMPERATURE,
            max_tokens: DEFAULT_MAX_TOKENS,
            stream: true,
            messages,
          });

          const encoder = new TextEncoder();
          let assistantText = "";
          const finalChatId = chatId;
          const sseStream = new ReadableStream({
            async start(controller) {
              controller.enqueue(encoder.encode(`event: meta\ndata: ${JSON.stringify({ chatId: finalChatId })}\n\n`));
              try {
                for await (const chunk of stream) {
                  const delta = chunk.choices[0]?.delta?.content ?? "";
                  if (delta) {
                    assistantText += delta;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
                  }
                }
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              } catch (err) {
                controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: (err as Error).message })}\n\n`));
              } finally {
                controller.close();
                if (assistantText) {
                  await supabase.from("ai_messages").insert({
                    chat_id: finalChatId, user_id: userId, role: "assistant", content: assistantText,
                  });
                  await supabase.from("ai_chats").update({ updated_at: new Date().toISOString() }).eq("id", finalChatId);
                }
              }
            },
          });

          return new Response(sseStream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        } catch (err) {
          console.error("ai.chat error:", err);
          return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
