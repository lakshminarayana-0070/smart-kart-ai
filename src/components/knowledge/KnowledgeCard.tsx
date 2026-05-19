import { motion } from "framer-motion";
import { Eye, Pencil, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIStatusBadge } from "./AIStatusBadge";
import { categoryEmoji, categoryLabel, wordCount, type KnowledgeEntry } from "@/lib/knowledge";

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

export function KnowledgeCard({
  entry, onView, onEdit, onDelete, onDuplicate,
}: {
  entry: KnowledgeEntry;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-2xl glass ai-border p-4 flex flex-col gap-3 overflow-hidden cursor-pointer"
      onClick={onView}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-primary/40 via-transparent to-accent/40 -z-10 blur" />

      <div className="flex items-start justify-between gap-2 relative">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="text-base">{categoryEmoji(entry.category)}</span>
          <span className="text-accent">{categoryLabel(entry.category)}</span>
        </div>
        <AIStatusBadge ready={!!entry.embedding} />
      </div>

      <div className="relative">
        <h3 className="font-semibold text-base leading-snug line-clamp-2">{entry.title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
      </div>

      {entry.keywords && entry.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 relative">
          {entry.keywords.slice(0, 4).map((k) => (
            <span key={k} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-muted-foreground">
              #{k}
            </span>
          ))}
          {entry.keywords.length > 4 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] text-muted-foreground">+{entry.keywords.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-muted-foreground relative mt-auto pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span>{wordCount(entry.content)} words</span>
          <span>·</span>
          <span>Updated {timeAgo(entry.updated_at)}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
          <Button size="icon" variant="ghost" className="size-7" onClick={(e) => { e.stopPropagation(); onView(); }}>
            <Eye className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Pencil className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
            <Copy className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}