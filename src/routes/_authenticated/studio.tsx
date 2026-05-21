import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Loader2, Check, FileText, MessageSquare, MessagesSquare, Megaphone, Brain } from "lucide-react";
import { generateDescription, analyzeReviews, generateReply, generateMarketing } from "@/ai/ai.functions";
import { toast } from "sonner";
import { RagBadge } from "@/components/ai/rag-badge";
import { NoMemoryBanner } from "@/components/ai/no-memory-banner";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({ meta: [{ title: "AI Studio — Smart Kart AI" }] }),
  component: StudioPage,
});

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      className="text-xs px-2 py-1 rounded-md glass hover:border-primary/40 inline-flex items-center gap-1"
    >
      {done ? <Check className="size-3" /> : <Copy className="size-3" />} {done ? "Copied" : "Copy"}
    </button>
  );
}

function StudioPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-widest text-accent flex items-center gap-1"><Sparkles className="size-3" /> AI Studio</div>
        <h1 className="text-3xl font-bold">Generate everything with AI</h1>
        <p className="text-sm text-muted-foreground">Descriptions, review insights, customer replies, marketing copy.</p>
      </div>

      <Tabs defaultValue="description">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-4">
          <TabsTrigger value="description"><FileText className="size-4 mr-1.5" />Description</TabsTrigger>
          <TabsTrigger value="reviews"><MessagesSquare className="size-4 mr-1.5" />Reviews</TabsTrigger>
          <TabsTrigger value="reply"><MessageSquare className="size-4 mr-1.5" />Reply</TabsTrigger>
          <TabsTrigger value="marketing"><Megaphone className="size-4 mr-1.5" />Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="description"><DescriptionTab /></TabsContent>
        <TabsContent value="reviews"><ReviewsTab /></TabsContent>
        <TabsContent value="reply"><ReplyTab /></TabsContent>
        <TabsContent value="marketing"><MarketingTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl glass ai-border p-5 space-y-3">{children}</div>;
}

function DescriptionTab() {
  const [form, setForm] = useState({ title: "", brand: "", category: "", features: "" });
  const fn = useServerFn(generateDescription);
  const m = useMutation({ mutationFn: () => fn({ data: form }), onError: (e: Error) => toast.error(e.message) });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <Input placeholder="Product title*" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <Textarea placeholder="Key features (one per line)" rows={6} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
        <Button onClick={() => m.mutate()} disabled={m.isPending || !form.title.trim()} className="w-full bg-gradient-primary text-primary-foreground glow">
          {m.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Generate
        </Button>
      </Card>
      <Card>
        {!m.data && <p className="text-sm text-muted-foreground">Output appears here.</p>}
        {m.data && (
          <div className="space-y-4">
            <Section title="Short" right={<CopyBtn text={m.data.short} />}><p className="text-sm">{m.data.short}</p></Section>
            <Section title="Long" right={<CopyBtn text={m.data.long} />}><p className="text-sm whitespace-pre-wrap">{m.data.long}</p></Section>
            <Section title="Highlights" right={<CopyBtn text={m.data.bullets.join("\n")} />}>
              <ul className="text-sm space-y-1">{m.data.bullets.map((b, i) => <li key={i}>· {b}</li>)}</ul>
            </Section>
            <Section title="SEO keywords" right={<CopyBtn text={m.data.seo_keywords.join(", ")} />}>
              <div className="flex flex-wrap gap-1">{m.data.seo_keywords.map((k, i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full glass">{k}</span>)}</div>
            </Section>
          </div>
        )}
      </Card>
    </div>
  );
}

function ReviewsTab() {
  const [text, setText] = useState("");
  const fn = useServerFn(analyzeReviews);
  const m = useMutation({
    mutationFn: () => fn({ data: { reviews: text.split("\n").map((s) => s.trim()).filter(Boolean) } }),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <p className="text-xs text-muted-foreground">Paste reviews (one per line, up to 50).</p>
        <Textarea rows={12} value={text} onChange={(e) => setText(e.target.value)} placeholder={"Loved the build quality, ships fast.\nBattery dies in 3 hours, disappointed."} />
        <Button onClick={() => m.mutate()} disabled={m.isPending || !text.trim()} className="w-full bg-gradient-primary text-primary-foreground glow">
          {m.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Analyze
        </Button>
      </Card>
      <Card>
        {!m.data && <p className="text-sm text-muted-foreground">Insights appear here.</p>}
        {m.data && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full text-xs bg-accent/10 text-accent font-semibold uppercase">{m.data.sentiment}</div>
              <div className="text-xs text-muted-foreground">Score {m.data.sentiment_score}/100 · AI confidence {m.data.ai_confidence}%</div>
            </div>
            <Section title="✓ Positive summary"><p className="text-sm">{m.data.positive_summary}</p></Section>
            <Section title="✗ Negative summary"><p className="text-sm">{m.data.negative_summary}</p></Section>
            <div className="grid grid-cols-2 gap-3">
              <Section title="Common praises"><ul className="text-sm space-y-1">{m.data.common_praises?.map((p: string, i: number) => <li key={i}>· {p}</li>)}</ul></Section>
              <Section title="Common complaints"><ul className="text-sm space-y-1">{m.data.common_complaints?.map((p: string, i: number) => <li key={i}>· {p}</li>)}</ul></Section>
            </div>
            {m.data.fake_review_indices?.length > 0 && (
              <Section title="⚠ Possible fake reviews">
                <p className="text-sm text-muted-foreground">Indices: {m.data.fake_review_indices.join(", ")}</p>
              </Section>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function ReplyTab() {
  const [form, setForm] = useState<{ message: string; context: string; tone: "friendly" | "professional" | "premium" | "concise" | "empathetic" }>({ message: "", context: "", tone: "professional" });
  const [phase, setPhase] = useState<"idle" | "retrieving" | "generating">("idle");
  const fn = useServerFn(generateReply);
  const m = useMutation({
    mutationFn: async () => {
      setPhase("retrieving");
      const retrievalUx = new Promise((r) => setTimeout(r, 650));
      const fetchPromise = fn({ data: form });
      await retrievalUx;
      setPhase("generating");
      const out = await fetchPromise;
      setPhase("idle");
      return out;
    },
    onError: (e: Error) => { setPhase("idle"); toast.error(e.message); },
  });
  const rag = (m.data as any)?._rag as
    | { used: boolean; count: number; matches: { id: string; title: string; category: string; similarity: number; content: string }[] }
    | undefined;
  const showNoMemoryBanner = !!m.data && (!rag || rag.count === 0);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <Textarea rows={6} placeholder="Customer message…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <Input placeholder="Order/context (optional)" value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} />
        <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["friendly", "professional", "premium", "concise", "empathetic"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => m.mutate()} disabled={m.isPending || !form.message.trim()} className="w-full bg-gradient-primary text-primary-foreground glow">
          {m.isPending ? (
            <><Loader2 className="size-4 animate-spin mr-1.5" /> {phase === "retrieving" ? "Searching memory…" : "Generating…"}</>
          ) : (
            <><Sparkles className="size-4 mr-1.5" /> Draft reply</>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
          <Brain className="size-3 text-accent" /> RAG-enhanced — personalized from your AI memory
        </p>
      </Card>
      <Card>
        {m.isPending && (
          <div className="space-y-2">
            <div className="text-xs text-accent inline-flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full size-2 bg-accent" />
              </span>
              {phase === "retrieving" ? "Searching memory…" : "Drafting email…"}
            </div>
            <div className="h-3 rounded bg-muted/40 animate-pulse" />
            <div className="h-3 rounded bg-muted/40 animate-pulse w-5/6" />
            <div className="h-3 rounded bg-muted/40 animate-pulse w-2/3" />
          </div>
        )}
        {!m.isPending && !m.data && <p className="text-sm text-muted-foreground">Drafted reply appears here.</p>}
        {m.data && (
          <div className="space-y-3">
            {showNoMemoryBanner && <NoMemoryBanner />}
            {rag && rag.count > 0 && <RagBadge matches={rag.matches} />}
            <Section title="Subject" right={<CopyBtn text={m.data.subject} />}><p className="text-sm">{m.data.subject}</p></Section>
            <Section title="Reply" right={<CopyBtn text={m.data.reply} />}><p className="text-sm whitespace-pre-wrap">{m.data.reply}</p></Section>
          </div>
        )}
      </Card>
    </div>
  );
}

function MarketingTab() {
  const [form, setForm] = useState<{ product: string; audience: string; tone: "bold" | "playful" | "premium" | "friendly" | "urgent" }>({ product: "", audience: "", tone: "bold" });
  const [phase, setPhase] = useState<"idle" | "retrieving" | "generating">("idle");
  const fn = useServerFn(generateMarketing);
  const m = useMutation({
    mutationFn: async () => {
      setPhase("retrieving");
      // brief retrieval-phase UX (server retrieves then generates; this shows the two phases visually)
      const retrievalUx = new Promise((r) => setTimeout(r, 650));
      const fetchPromise = fn({ data: form });
      await retrievalUx;
      setPhase("generating");
      const out = await fetchPromise;
      setPhase("idle");
      return out;
    },
    onError: (e: Error) => { setPhase("idle"); toast.error(e.message); },
  });
  const rag = (m.data as any)?._rag as
    | { used: boolean; count: number; matches: { id: string; title: string; category: string; similarity: number; content: string }[] }
    | undefined;
  const showNoMemoryBanner = !!m.data && (!rag || rag.count === 0);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <Input placeholder="Product (e.g. AI noise-canceling earbuds)" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
        <Input placeholder="Audience (e.g. remote workers, runners)" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
        <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["bold", "playful", "premium", "friendly", "urgent"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => m.mutate()} disabled={m.isPending || !form.product.trim()} className="w-full bg-gradient-primary text-primary-foreground glow">
          {m.isPending ? (
            <><Loader2 className="size-4 animate-spin mr-1.5" /> {phase === "retrieving" ? "Searching memory…" : "Generating…"}</>
          ) : (
            <><Sparkles className="size-4 mr-1.5" /> Generate campaign</>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
          <Brain className="size-3 text-accent" /> RAG-enhanced — personalized from your AI memory
        </p>
      </Card>
      <Card>
        {m.isPending && (
          <div className="space-y-2">
            <div className="text-xs text-accent inline-flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full size-2 bg-accent" />
              </span>
              {phase === "retrieving" ? "Searching memory…" : "Generating campaign…"}
            </div>
            <div className="h-3 rounded bg-muted/40 animate-pulse" />
            <div className="h-3 rounded bg-muted/40 animate-pulse w-5/6" />
            <div className="h-3 rounded bg-muted/40 animate-pulse w-2/3" />
          </div>
        )}
        {!m.isPending && !m.data && <p className="text-sm text-muted-foreground">Campaign assets appear here.</p>}
        {m.data && (
          <div className="space-y-3">
            {showNoMemoryBanner && <NoMemoryBanner />}
            {rag && rag.count > 0 && <RagBadge matches={rag.matches} />}
            <Section title="Headlines"><ul className="text-sm space-y-1">{m.data.headlines?.map((h: string, i: number) => <li key={i} className="flex items-center justify-between gap-2"><span>· {h}</span><CopyBtn text={h} /></li>)}</ul></Section>
            <Section title="Ad copy"><ul className="text-sm space-y-2">{m.data.ad_copy?.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul></Section>
            <Section title="Instagram caption" right={<CopyBtn text={m.data.instagram_caption} />}><p className="text-sm whitespace-pre-wrap">{m.data.instagram_caption}</p></Section>
            <Section title="Facebook ad" right={<CopyBtn text={m.data.facebook_ad} />}><p className="text-sm whitespace-pre-wrap">{m.data.facebook_ad}</p></Section>
            <Section title="Email subject" right={<CopyBtn text={m.data.email_subject} />}><p className="text-sm">{m.data.email_subject}</p></Section>
            <Section title="Email body" right={<CopyBtn text={m.data.email_body} />}><p className="text-sm whitespace-pre-wrap">{m.data.email_body}</p></Section>
            <Section title="Push notification" right={<CopyBtn text={m.data.push_notification} />}><p className="text-sm">{m.data.push_notification}</p></Section>
            <Section title="SEO keywords" right={<CopyBtn text={m.data.seo_keywords?.join(", ") ?? ""} />}>
              <div className="flex flex-wrap gap-1">{m.data.seo_keywords?.map((k: string, i: number) => <span key={i} className="text-xs px-2 py-0.5 rounded-full glass">{k}</span>)}</div>
            </Section>
          </div>
        )}
      </Card>
    </div>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground">{title}</h4>
        {right}
      </div>
      {children}
    </div>
  );
}
