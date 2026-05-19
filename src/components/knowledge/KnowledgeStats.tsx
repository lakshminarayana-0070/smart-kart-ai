import { motion } from "framer-motion";
import { Database, Layers, Clock, Sparkles } from "lucide-react";
import type { KnowledgeEntry } from "@/lib/knowledge";

export function KnowledgeStats({ entries }: { entries: KnowledgeEntry[] }) {
  const total = entries.length;
  const categories = new Set(entries.map((e) => e.category)).size;
  const recent = entries.filter(
    (e) => Date.now() - new Date(e.updated_at).getTime() < 7 * 86400_000,
  ).length;
  const aiReady = entries.filter((e) => e.embedding).length;
  const aiPct = total ? Math.round((aiReady / total) * 100) : 0;

  const cards = [
    { label: "Total Entries", value: total, icon: Database, accent: "from-primary/30 to-primary/5" },
    { label: "Categories Used", value: `${categories}/12`, icon: Layers, accent: "from-accent/30 to-accent/5" },
    { label: "Updated This Week", value: recent, icon: Clock, accent: "from-fuchsia-500/30 to-fuchsia-500/5" },
    { label: "AI Retrieval Ready", value: `${aiPct}%`, icon: Sparkles, accent: "from-cyan-400/30 to-cyan-400/5" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl glass ai-border p-4 group"
        >
          <div className={`absolute -top-10 -right-10 size-28 rounded-full bg-gradient-to-br ${c.accent} blur-2xl opacity-70 group-hover:opacity-100 transition`} />
          <c.icon className="size-4 text-accent relative" />
          <div className="mt-2 text-2xl font-bold tracking-tight relative">{c.value}</div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground relative">{c.label}</div>
        </motion.div>
      ))}
    </div>
  );
}