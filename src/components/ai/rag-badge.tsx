import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ArrowRight, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type RagBadgeMatch = {
  id: string;
  title: string;
  category: string;
  similarity: number;
  content: string;
};

function prettyCategory(c: string): string {
  return c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function RagBadge({ matches }: { matches: RagBadgeMatch[] }) {
  const [open, setOpen] = useState(false);
  if (!matches.length) return null;
  return (
    <div className="rounded-xl glass ai-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2 text-left">
          <div className="size-7 rounded-lg bg-gradient-primary glow flex items-center justify-center shrink-0">
            <Sparkles className="size-3.5 text-primary-foreground" />
          </div>
          <div className="text-xs">
            <span className="font-semibold">✨ Generated using {matches.length} memory {matches.length === 1 ? "entry" : "entries"}</span>
            <span className="ml-1 text-muted-foreground">— personalized to your store</span>
          </div>
        </div>
        <ChevronDown className={`size-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-3 space-y-2">
              {matches
                .slice()
                .sort((a, b) => b.similarity - a.similarity)
                .map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg p-2.5 bg-background/40 border border-white/5 hover:border-accent/30 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Badge variant="outline" className="text-[10px]">
                        {prettyCategory(m.category)}
                      </Badge>
                      <span className="text-xs font-medium truncate">{m.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-accent shrink-0">
                      {Math.round(m.similarity * 100)}% match
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                    {m.content}
                  </p>
                </div>
              ))}
              <Link
                to="/shopping-memory"
                className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline pt-1"
              >
                <Brain className="size-3" /> Manage Memory <ArrowRight className="size-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}