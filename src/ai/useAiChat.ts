import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function useAiChat(initial: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [streaming, setStreaming] = useState(false);
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback((msgs: ChatMessage[] = [], id?: string) => {
    setMessages(msgs); setChatId(id);
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    setMessages((p) => [...p, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not signed in");
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, chatId }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let currentEvent = "message";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line === "") { currentEvent = "message"; continue; }
          if (line.startsWith("event: ")) { currentEvent = line.slice(7).trim(); continue; }
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(payload);
            if (currentEvent === "meta" && parsed.chatId) setChatId(parsed.chatId);
            else if (currentEvent === "error") throw new Error(parsed.message || "Stream error");
            else if (parsed.delta) {
              setMessages((prev) => {
                const out = prev.slice();
                const last = out[out.length - 1];
                if (last?.role === "assistant") out[out.length - 1] = { ...last, content: last.content + parsed.delta };
                return out;
              });
            }
          } catch (e) {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((p) => {
          const out = p.slice();
          const last = out[out.length - 1];
          if (last?.role === "assistant" && !last.content) out[out.length - 1] = { role: "assistant", content: `⚠️ ${err.message}` };
          return out;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [chatId, streaming]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  return { messages, streaming, chatId, send, stop, reset, setChatId };
}
