import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, Sparkles, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

import { useAuth } from "@/contexts/AuthContext";
import { listMemoryFn, deleteMemoryFn, searchMemoryFn, type MemorySearchResult } from "@/lib/shopping.functions";
import { embedAndSaveFn } from "@/lib/smart-kart-knowledge.functions";
import { CATEGORIES, categoryEmoji, categoryLabel, type KnowledgeCategory } from "@/lib/knowledge";
import { Search, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shopping-memory")({
  component: ShoppingMemoryPage,
});

const MIN_CONTENT = 20;
const MAX_CONTENT = 8000;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  const mo = Math.floor(d / 30);
  return `${mo} month${mo === 1 ? "" : "s"} ago`;
}

function ShoppingMemoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listMemoryFn);
  const del = useServerFn(deleteMemoryFn);
  const embedSave = useServerFn(embedAndSaveFn);

  const queryKey = useMemo(() => ["shopping-memory", user?.id], [user?.id]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => list(),
    enabled: !!user,
  });

  const [name, setName] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory>("product_catalog_notes");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const resetForm = () => {
    setName(""); setTitle(""); setContent(""); setKeywords("");
    setCategory("product_catalog_notes");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const kw = keywords.split(",").map((k) => k.trim()).filter(Boolean);
      // tiny artificial pause so the embedding step "feels" intentional
      await new Promise((r) => setTimeout(r, 600));
      return await embedSave({
        data: {
          knowledge_name: name.trim() || title.trim(),
          category,
          title: title.trim(),
          content: content.trim(),
          keywords: kw,
          business_name: "Smart Kart AI",
        },
      });
    },
    onSuccess: () => {
      toast.success("Knowledge saved successfully");
      resetForm();
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save memory"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Memory deleted");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete"),
    onSettled: () => setPendingDelete(null),
  });

  const canSave =
    name.trim().length > 0 &&
    title.trim().length > 0 &&
    content.trim().length >= MIN_CONTENT &&
    !saveMutation.isPending;

  type Entry = NonNullable<typeof data>["entries"][number];
  const grouped = useMemo(() => {
    const map = new Map<KnowledgeCategory, Entry[]>();
    (data?.entries ?? []).forEach((e) => {
      const arr = map.get(e.category) ?? [];
      arr.push(e);
      map.set(e.category, arr);
    });
    return map;
  }, [data]);

  return (
    <div className="relative min-h-screen">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent blur-2xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-primary glow mb-4">
            <Brain className="size-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Train Your AI on Your{" "}
            <span className="text-gradient">Shopping Knowledge</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Teach Smart Kart AI about your products, customers, business rules, offers,
            FAQs, and shopping insights so your AI becomes smarter and personalized to your store.
          </p>
        </motion.div>

        {/* Add Card */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="glass ai-border rounded-2xl p-5 sm:p-6 mb-10"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="size-4 text-accent" />
            <h2 className="font-semibold text-lg">Add Knowledge to AI Memory</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Shopping Knowledge Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summer Fashion Catalog"
                maxLength={200}
                className="mt-1 bg-transparent border-white/10"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Category
              </label>
              <Select value={category} onValueChange={(v) => setCategory(v as KnowledgeCategory)}>
                <SelectTrigger className="mt-1 bg-transparent border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Return Policy Rules"
              maxLength={200}
              className="mt-1 bg-transparent border-white/10"
            />
          </div>

          <div className="mt-4">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Customers can return products within 7 days if the product is unused and in original packaging..."
              rows={6}
              maxLength={MAX_CONTENT}
              className="mt-1 bg-transparent border-white/10 resize-y min-h-[140px]"
            />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>
                {content.trim().length < MIN_CONTENT
                  ? `${MIN_CONTENT - content.trim().length} more chars required`
                  : "Looking good ✨"}
              </span>
              <span>{content.length}/{MAX_CONTENT}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Keywords <span className="opacity-60">(comma separated)</span>
            </label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="returns, refund, policy"
              className="mt-1 bg-transparent border-white/10"
            />
            {keywords.trim() && (
              <div className="flex flex-wrap gap-1 mt-2">
                {keywords.split(",").map((k) => k.trim()).filter(Boolean).map((k) => (
                  <span key={k} className="px-2 py-0.5 rounded-full text-[11px] bg-accent/10 border border-accent/30 text-accent">
                    #{k}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              disabled={!canSave}
              onClick={() => saveMutation.mutate()}
              className="bg-gradient-primary text-primary-foreground glow"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="size-4 mr-1.5 animate-spin" /> Embedding…</>
              ) : (
                <><Sparkles className="size-4 mr-1.5" /> Save to AI Memory</>
              )}
            </Button>
          </div>
        </motion.section>

        {/* List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Your AI Memory</h2>
            <Badge variant="secondary" className="text-[11px]">
              {data?.entries.length ?? 0} entries
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : (data?.entries.length ?? 0) === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border-2 border-dashed border-white/10 p-12 text-center"
            >
              <div className="inline-flex size-14 rounded-2xl bg-muted/40 items-center justify-center mb-3">
                <Brain className="size-6 text-muted-foreground" />
              </div>
              <div className="font-semibold">No memory yet</div>
              <div className="text-sm text-muted-foreground mt-1">
                Add your first AI training entry above ☝️
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {CATEGORIES.map((cat) => {
                const entries = grouped.get(cat.value);
                if (!entries || entries.length === 0) return null;
                return (
                  <div key={cat.value}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{cat.emoji}</span>
                      <h3 className="font-medium text-sm">{cat.label}</h3>
                      <span className="text-[11px] text-muted-foreground">({entries.length})</span>
                    </div>
                    <AnimatePresence initial={false}>
                      <div className="grid gap-3">
                        {entries.map((e) => (
                          <motion.article
                            key={e.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            className="group glass rounded-xl p-4 hover:border-accent/40 hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.4)] transition"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-[10px]">
                                    {categoryEmoji(e.category)} {categoryLabel(e.category)}
                                  </Badge>
                                  {e.knowledge_name && (
                                    <span className="text-[11px] text-muted-foreground truncate">
                                      {e.knowledge_name}
                                    </span>
                                  )}
                                </div>
                                <h4 className="mt-2 font-semibold truncate">{e.title}</h4>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                                  {e.content}
                                </p>
                                {e.keywords && e.keywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {e.keywords.map((k) => (
                                      <span key={k} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] bg-muted text-muted-foreground">
                                        <Tag className="size-2.5" /> {k}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="mt-2 text-[10px] text-muted-foreground">
                                  {timeAgo(e.created_at)}
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setPendingDelete(e.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </motion.article>
                        ))}
                      </div>
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This knowledge will permanently be removed from your AI memory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}