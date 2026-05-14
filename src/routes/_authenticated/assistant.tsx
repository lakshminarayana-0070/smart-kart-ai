import { createFileRoute } from "@tanstack/react-router";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — Smart Kart AI" }] }),
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-widest text-accent flex items-center gap-1"><Sparkles className="size-3" /> AI Shopping Assistant</div>
        <h1 className="text-3xl font-bold">Chat with Smart Kart AI</h1>
        <p className="text-sm text-muted-foreground">Personal shopping co-pilot — recommendations, comparisons, budgets, gifts.</p>
      </div>
      <div className="rounded-3xl glass ai-border h-[70vh] flex flex-col overflow-hidden">
        <ChatPanel />
      </div>
    </div>
  );
}
