import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Brain, Loader2 } from "lucide-react";
import { CATEGORIES, type KnowledgeCategory, type KnowledgeEntry, wordCount } from "@/lib/knowledge";

export type KnowledgeDraft = {
  title: string;
  content: string;
  category: KnowledgeCategory;
  business_name: string;
  keywords: string[];
  allowAI: boolean;
  pinned: boolean;
};

export function KnowledgeModal({
  open, onOpenChange, initial, onSave, saving,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: KnowledgeEntry | null;
  onSave: (draft: KnowledgeDraft, addAnother: boolean) => Promise<void> | void;
  saving?: boolean;
}) {
  const [draft, setDraft] = useState<KnowledgeDraft>(() => ({
    title: "", content: "", category: "custom_ai_instructions",
    business_name: "Smart Kart AI", keywords: [], allowAI: true, pinned: false,
  }));
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open) {
      if (initial) {
        setDraft({
          title: initial.title, content: initial.content,
          category: initial.category, business_name: initial.business_name,
          keywords: initial.keywords ?? [], allowAI: true, pinned: false,
        });
      } else {
        setDraft({
          title: "", content: "", category: "custom_ai_instructions",
          business_name: "Smart Kart AI", keywords: [], allowAI: true, pinned: false,
        });
      }
      setTagInput("");
    }
  }, [open, initial]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || draft.keywords.includes(t)) return;
    setDraft({ ...draft, keywords: [...draft.keywords, t] });
    setTagInput("");
  };

  const submit = async (addAnother: boolean) => {
    if (!draft.title.trim() || !draft.content.trim()) return;
    await onSave(draft, addAnother);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass ai-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-primary grid place-items-center glow">
              <Brain className="size-4 text-primary-foreground" />
            </div>
            {initial ? "Edit Knowledge" : "Add Knowledge"}
          </DialogTitle>
          <DialogDescription>
            Train Smart Kart AI with personalized context. This will be retrieved during AI conversations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Title</label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. I prefer sustainable, mid-range fashion brands"
              maxLength={200}
              className="mt-1 bg-transparent border-white/10"
            />
            <div className="text-[10px] text-muted-foreground text-right mt-0.5">{draft.title.length}/200</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Category</label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as KnowledgeCategory })}>
                <SelectTrigger className="mt-1 bg-transparent border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Business / Scope</label>
              <Input
                value={draft.business_name}
                onChange={(e) => setDraft({ ...draft, business_name: e.target.value })}
                placeholder="Smart Kart AI"
                className="mt-1 bg-transparent border-white/10"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Content</label>
            <Textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="Write detailed context the AI should remember…"
              rows={8}
              className="mt-1 bg-transparent border-white/10 resize-none"
            />
            <div className="text-[10px] text-muted-foreground text-right mt-0.5">{wordCount(draft.content)} words</div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Keywords / Tags</label>
            <div className="mt-1 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type and press Enter…"
                className="bg-transparent border-white/10"
              />
              <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
            </div>
            {draft.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {draft.keywords.map((k) => (
                  <button
                    key={k}
                    onClick={() => setDraft({ ...draft, keywords: draft.keywords.filter((x) => x !== k) })}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-accent/10 border border-accent/30 text-accent hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition"
                  >
                    #{k} ✕
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between rounded-xl border border-white/10 p-3">
              <div>
                <div className="text-sm font-medium flex items-center gap-1.5"><Sparkles className="size-3.5 text-accent" /> Allow AI Retrieval</div>
                <div className="text-[11px] text-muted-foreground">Available for RAG context</div>
              </div>
              <Switch checked={draft.allowAI} onCheckedChange={(v) => setDraft({ ...draft, allowAI: v })} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-white/10 p-3">
              <div>
                <div className="text-sm font-medium">Pin Entry</div>
                <div className="text-[11px] text-muted-foreground">Always include in context</div>
              </div>
              <Switch checked={draft.pinned} onCheckedChange={(v) => setDraft({ ...draft, pinned: v })} />
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!initial && (
            <Button variant="secondary" disabled={saving} onClick={() => submit(true)}>
              Save & Add Another
            </Button>
          )}
          <Button
            disabled={saving || !draft.title.trim() || !draft.content.trim()}
            onClick={() => submit(false)}
            className="bg-gradient-primary text-primary-foreground glow"
          >
            {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Sparkles className="size-4 mr-1" />}
            {initial ? "Save changes" : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}