import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Copy, Sparkles, Clock, Hash, FileText } from "lucide-react";
import { AIStatusBadge } from "./AIStatusBadge";
import { categoryEmoji, categoryLabel, wordCount, type KnowledgeEntry } from "@/lib/knowledge";
import { toast } from "sonner";

export function KnowledgeDrawer({
  entry, onClose, onEdit, onDelete,
}: {
  entry: KnowledgeEntry | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Sheet open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl glass ai-border overflow-y-auto">
        {entry && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-accent">
                <span className="text-base">{categoryEmoji(entry.category)}</span>
                {categoryLabel(entry.category)}
              </div>
              <SheetTitle className="text-2xl">{entry.title}</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <AIStatusBadge ready={!!entry.embedding} />
                <span className="text-xs">{entry.business_name}</span>
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 whitespace-pre-wrap text-sm leading-relaxed">
                {entry.content}
              </div>

              {entry.keywords && entry.keywords.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1"><Hash className="size-3" /> Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.keywords.map((k) => (
                      <span key={k} className="px-2.5 py-1 rounded-full text-xs bg-accent/10 border border-accent/30 text-accent">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Meta icon={FileText} label="Word count" value={`${wordCount(entry.content)} words`} />
                <Meta icon={Sparkles} label="Embedding" value={entry.embedding ? "Indexed" : "Pending"} />
                <Meta icon={Clock} label="Created" value={new Date(entry.created_at).toLocaleString()} />
                <Meta icon={Clock} label="Updated" value={new Date(entry.updated_at).toLocaleString()} />
              </div>

              <div className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 text-accent font-medium mb-1"><Sparkles className="size-3" /> AI Retrieval</div>
                This entry will be matched semantically when relevant to your AI conversations.
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => toast.info("Embedding regeneration queued (coming soon)")}>
                    Generate Embedding
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.info("Re-index queued (coming soon)")}>
                    Re-index
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <Button onClick={onEdit} className="flex-1 bg-gradient-primary text-primary-foreground glow">
                  <Pencil className="size-4 mr-1" /> Edit
                </Button>
                <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(entry.content); toast.success("Content copied"); }}>
                  <Copy className="size-4" />
                </Button>
                <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Meta({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
        <Icon className="size-3" /> {label}
      </div>
      <div className="mt-0.5 truncate">{value}</div>
    </div>
  );
}