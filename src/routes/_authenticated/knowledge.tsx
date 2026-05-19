import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Brain, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { KnowledgeStats } from "@/components/knowledge/KnowledgeStats";
import { KnowledgeFilters, type SortKey } from "@/components/knowledge/KnowledgeFilters";
import { KnowledgeCard } from "@/components/knowledge/KnowledgeCard";
import { KnowledgeModal, type KnowledgeDraft } from "@/components/knowledge/KnowledgeModal";
import { KnowledgeDrawer } from "@/components/knowledge/KnowledgeDrawer";
import { EmptyKnowledgeState } from "@/components/knowledge/EmptyKnowledgeState";
import type { KnowledgeCategory, KnowledgeEntry } from "@/lib/knowledge";

export const Route = createFileRoute("/_authenticated/knowledge")({
  head: () => ({
    meta: [
      { title: "AI Knowledge Base — Smart Kart AI" },
      { name: "description", content: "Train Smart Kart AI with personalized knowledge and context for smarter, more relevant responses." },
      { property: "og:title", content: "AI Knowledge Base — Smart Kart AI" },
      { property: "og:description", content: "Manage AI memory: shopping preferences, brands, budget rules, business notes, and more." },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("updated");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [viewing, setViewing] = useState<KnowledgeEntry | null>(null);
  const [deleting, setDeleting] = useState<KnowledgeEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("smart_kart_ai_knowledge")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    else setEntries(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const filtered = useMemo(() => {
    let list = entries;
    if (category !== "all") list = list.filter((e) => e.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        (e.keywords ?? []).some((k) => k.toLowerCase().includes(q)),
      );
    }
    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const key = sort === "created" ? "created_at" : "updated_at";
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    });
    return list;
  }, [entries, category, query, sort]);

  const handleSave = async (draft: KnowledgeDraft, addAnother: boolean) => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      title: draft.title.trim(),
      content: draft.content.trim(),
      category: draft.category,
      business_name: draft.business_name.trim() || "Smart Kart AI",
      keywords: draft.keywords,
    };
    if (editing) {
      const { error } = await supabase
        .from("smart_kart_ai_knowledge")
        .update(payload).eq("id", editing.id);
      if (error) toast.error(error.message);
      else toast.success("Entry updated");
    } else {
      const { error } = await supabase
        .from("smart_kart_ai_knowledge")
        .insert(payload);
      if (error) toast.error(error.message);
      else toast.success("Knowledge saved");
    }
    setSaving(false);
    await load();
    if (!addAnother) {
      setModalOpen(false);
      setEditing(null);
    }
  };

  const handleDuplicate = async (e: KnowledgeEntry) => {
    if (!user) return;
    const { error } = await supabase.from("smart_kart_ai_knowledge").insert({
      user_id: user.id,
      title: `${e.title} (copy)`,
      content: e.content,
      category: e.category,
      business_name: e.business_name,
      keywords: e.keywords ?? [],
    });
    if (error) toast.error(error.message);
    else { toast.success("Duplicated"); load(); }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase
      .from("smart_kart_ai_knowledge").delete().eq("id", deleting.id);
    if (error) toast.error(error.message);
    else { toast.success("Entry deleted"); setViewing(null); load(); }
    setDeleting(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="text-xs uppercase tracking-widest text-accent flex items-center gap-1">
            <Sparkles className="size-3" /> AI Memory · Personalized Context
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mt-1 flex items-center gap-2">
            <span className="inline-grid place-items-center size-10 rounded-2xl bg-gradient-primary glow">
              <Brain className="size-5 text-primary-foreground" />
            </span>
            AI Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Train Smart Kart AI with your personalized knowledge and context.
          </p>
        </div>
        <Button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="bg-gradient-primary text-primary-foreground glow"
        >
          <Plus className="size-4 mr-1" /> Add Knowledge
        </Button>
      </motion.div>

      <KnowledgeStats entries={entries} />

      <KnowledgeFilters
        query={query} onQuery={setQuery}
        category={category} onCategory={setCategory}
        sort={sort} onSort={setSort}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyKnowledgeState
          onCreate={() => { setEditing(null); setModalOpen(true); }}
          filtered={entries.length > 0}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map((e) => (
              <KnowledgeCard
                key={e.id}
                entry={e}
                onView={() => setViewing(e)}
                onEdit={() => { setEditing(e); setModalOpen(true); }}
                onDelete={() => setDeleting(e)}
                onDuplicate={() => handleDuplicate(e)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Mobile floating action */}
      <Button
        onClick={() => { setEditing(null); setModalOpen(true); }}
        className="md:hidden fixed bottom-20 right-4 size-14 rounded-full bg-gradient-primary text-primary-foreground glow shadow-lg z-40"
      >
        <Plus className="size-6" />
      </Button>

      <KnowledgeModal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) setEditing(null); }}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />

      <KnowledgeDrawer
        entry={viewing}
        onClose={() => setViewing(null)}
        onEdit={() => { if (viewing) { setEditing(viewing); setViewing(null); setModalOpen(true); } }}
        onDelete={() => { if (viewing) { setDeleting(viewing); } }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="glass ai-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.4 }}
                className="size-8 rounded-xl bg-destructive/15 grid place-items-center"
              >
                <Loader2 className="size-4 text-destructive" />
              </motion.div>
              Delete this entry?
            </AlertDialogTitle>
            <AlertDialogDescription>
              "<span className="text-foreground font-medium">{deleting?.title}</span>" will be permanently removed from your AI memory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}