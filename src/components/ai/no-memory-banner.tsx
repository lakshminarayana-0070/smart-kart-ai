import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowRight } from "lucide-react";

export function NoMemoryBanner({ message }: { message?: string }) {
  return (
    <Link
      to="/shopping-memory"
      className="group block rounded-xl p-3 border border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent shadow-[0_0_24px_-12px_hsl(var(--primary)/0.6)] hover:border-primary/50 transition"
    >
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-gradient-primary glow flex items-center justify-center shrink-0">
          <Lightbulb className="size-4 text-primary-foreground" />
        </div>
        <div className="text-xs flex-1">
          <div className="font-semibold">💡 Add memory to make outputs sound uniquely yours</div>
          <div className="text-muted-foreground">
            {message ?? "Train Smart Kart AI on your products, tone, and policies."}
          </div>
        </div>
        <ArrowRight className="size-4 text-accent group-hover:translate-x-0.5 transition shrink-0" />
      </div>
    </Link>
  );
}