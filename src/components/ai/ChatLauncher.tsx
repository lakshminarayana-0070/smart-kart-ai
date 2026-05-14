import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";

export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI assistant"
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-gradient-primary glow grid place-items-center text-primary-foreground shadow-2xl hover:scale-105 transition"
      >
        {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </button>
      <div
        className={cn(
          "fixed bottom-24 right-5 z-50 w-[min(420px,calc(100vw-2.5rem))] h-[min(640px,calc(100vh-8rem))] rounded-3xl glass ai-border overflow-hidden shadow-2xl flex flex-col transition-all origin-bottom-right",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-primary grid place-items-center"><Sparkles className="size-4 text-primary-foreground" /></div>
          <div className="font-semibold text-sm">Smart Kart AI</div>
          <span className="text-[10px] uppercase tracking-widest text-accent ml-auto">live</span>
        </div>
        <div className="flex-1 min-h-0"><ChatPanel dense /></div>
      </div>
    </>
  );
}
