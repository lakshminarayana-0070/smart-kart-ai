import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIStatusBadge({ ready = true, className }: { ready?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        ready
          ? "bg-accent/15 text-accent border border-accent/30"
          : "bg-muted text-muted-foreground border border-border",
        className,
      )}
    >
      {ready ? <Sparkles className="size-2.5" /> : <Zap className="size-2.5" />}
      {ready ? "AI Ready" : "Pending"}
    </span>
  );
}