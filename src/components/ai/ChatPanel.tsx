import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Square, Sparkles, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiChat, type ChatMessage } from "@/ai/useAiChat";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Suggest a gift for a coffee lover under $80",
  "Compare wireless earbuds for running",
  "Build a $200 work-from-home starter kit",
  "What's trending in minimalist hoodies?",
];

export function ChatPanel({ initialMessages = [], initialChatId, dense = false }: { initialMessages?: ChatMessage[]; initialChatId?: string; dense?: boolean }) {
  const { messages, streaming, send, stop, reset } = useAiChat(initialMessages);
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { reset(initialMessages, initialChatId); /* eslint-disable-next-line */ }, [initialChatId]);
  useEffect(() => { scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = input.trim(); if (!v) return;
    setInput(""); send(v);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollerRef} className={cn("flex-1 overflow-y-auto px-4 py-4 space-y-4", dense && "py-3 space-y-3")}>
        {messages.length === 0 && (
          <div className="grid place-items-center h-full text-center">
            <div className="max-w-md">
              <div className="size-12 rounded-2xl bg-gradient-primary grid place-items-center mx-auto glow mb-3">
                <Sparkles className="size-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg">Smart Kart AI Assistant</h3>
              <p className="text-sm text-muted-foreground mb-4">Ask anything about products, budgets, gifts, or trends.</p>
              <div className="grid gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-left text-sm px-3 py-2 rounded-xl glass hover:border-primary/40 transition">{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "assistant" && (
              <div className="size-8 rounded-full bg-gradient-primary grid place-items-center shrink-0 glow"><Bot className="size-4 text-primary-foreground" /></div>
            )}
            <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm",
              m.role === "user" ? "bg-primary text-primary-foreground" : "glass ai-border")}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  {streaming && i === messages.length - 1 && <span className="inline-block w-1.5 h-4 ml-0.5 bg-accent animate-pulse align-middle" />}
                </div>
              ) : <p className="whitespace-pre-wrap">{m.content}</p>}
            </div>
            {m.role === "user" && (
              <div className="size-8 rounded-full glass grid place-items-center shrink-0"><UserIcon className="size-4" /></div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="border-t bg-background/60 backdrop-blur p-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Ask Smart Kart AI…"
          rows={1}
          className="flex-1 resize-none rounded-2xl bg-background/50 border border-primary/20 px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 max-h-32"
        />
        {streaming ? (
          <Button type="button" onClick={stop} variant="outline" size="icon" className="size-10 rounded-full"><Square className="size-4" /></Button>
        ) : (
          <Button type="submit" size="icon" className="size-10 rounded-full bg-gradient-primary text-primary-foreground glow" disabled={!input.trim()}>
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
