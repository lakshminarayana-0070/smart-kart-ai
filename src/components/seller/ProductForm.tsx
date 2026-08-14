import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, ImageOff } from "lucide-react";
import { productInputSchema, type ProductInput } from "@/lib/products.schema";
import { CURRENCIES, CURRENCY_CODES } from "@/lib/currency";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export type ProductFormValues = ProductInput;

export const emptyProduct: ProductFormValues = {
  name: "",
  brand: "",
  sku: "",
  description: "",
  category_id: "",
  subcategory_id: null,
  tags: [],
  features: [],
  specifications: {},
  price: 0,
  compare_at_price: null,
  currency: "USD",
  stock: 1,
  image_url: null,
  images: [],
  status: "active",
};

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
  saving,
}: {
  initial: ProductFormValues;
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: ProductFormValues) => void;
}) {
  const { user } = useAuth();
  const [v, setV] = useState<ProductFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const set = <K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const { data: cats } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });
  const parents = useMemo(() => (cats ?? []).filter((c: any) => !c.parent_id), [cats]);
  const subs = useMemo(
    () => (cats ?? []).filter((c: any) => c.parent_id === v.category_id),
    [cats, v.category_id],
  );

  const allImages = [v.image_url, ...v.images].filter(Boolean) as string[];

  const upload = async (files: FileList | null) => {
    if (!files?.length || !user) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 8)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, {
          upsert: false,
          contentType: file.type || undefined,
        });
        if (error) throw error;
        const { data } = await supabase.storage.from("product-images").createSignedUrl(path, TEN_YEARS);
        if (data?.signedUrl) urls.push(data.signedUrl);
      }
      setV((p) => {
        const combined = [...(p.image_url ? [p.image_url] : []), ...p.images, ...urls].slice(0, 8);
        return { ...p, image_url: combined[0] ?? null, images: combined.slice(1) };
      });
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (e: any) {
      toast.error(e?.message ?? "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const setPrimary = (url: string) => {
    const rest = allImages.filter((u) => u !== url);
    setV((p) => ({ ...p, image_url: url, images: rest }));
  };
  const removeImage = (url: string) => {
    const rest = allImages.filter((u) => u !== url);
    setV((p) => ({ ...p, image_url: rest[0] ?? null, images: rest.slice(1) }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = productInputSchema.safeParse(v);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) map[String(issue.path[0])] = issue.message;
      setErrors(map);
      toast.error(parsed.error.issues[0]?.message ?? "Please fix the form");
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  };

  const err = (k: string) => errors[k] && <p className="text-xs text-destructive mt-1">{errors[k]}</p>;

  return (
    <form onSubmit={submit} className="space-y-8">
      <Card title="Basic information">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Product name *</Label>
            <Input value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="AuraPods Pro Wireless" />
            {err("name")}
          </div>
          <div>
            <Label>Brand</Label>
            <Input value={v.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Aura" />
          </div>
          <div>
            <Label>SKU</Label>
            <Input value={v.sku} onChange={(e) => set("sku", e.target.value)} placeholder="AUR-PODS-001" />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea rows={4} value={v.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card title="Classification">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Category *</Label>
            <select
              value={v.category_id}
              onChange={(e) => setV((p) => ({ ...p, category_id: e.target.value, subcategory_id: null }))}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select a category</option>
              {parents.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {err("category_id")}
          </div>
          <div>
            <Label>Subcategory</Label>
            <select
              value={v.subcategory_id ?? ""}
              onChange={(e) => set("subcategory_id", e.target.value || null)}
              disabled={subs.length === 0}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm disabled:opacity-50"
            >
              <option value="">{subs.length ? "Select a subcategory" : "None available"}</option>
              {subs.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <ChipEditor
          label="Tags"
          value={v.tags}
          input={tagInput}
          setInput={setTagInput}
          onChange={(next) => set("tags", next)}
          placeholder="wireless"
        />
      </Card>

      <Card title="Images">
        <div className="flex flex-wrap gap-3">
          {allImages.map((url) => (
            <div key={url} className="relative size-24 rounded-xl overflow-hidden border group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {url === v.image_url && (
                <span className="absolute bottom-0 inset-x-0 text-[10px] text-center bg-gradient-primary text-primary-foreground">Primary</span>
              )}
              <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => setPrimary(url)}>Primary</Button>
                <Button type="button" size="icon" variant="ghost" className="size-7" onClick={() => removeImage(url)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
          <label className="size-24 rounded-xl border border-dashed grid place-items-center cursor-pointer hover:border-primary/50 text-muted-foreground">
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
            <input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          </label>
        </div>
        {allImages.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <ImageOff className="size-3" /> No images yet — a placeholder will be shown in the catalog.
          </p>
        )}
      </Card>

      <Card title="Pricing & inventory">
        <div className="grid sm:grid-cols-4 gap-4">
          <div>
            <Label>Current price *</Label>
            <Input type="number" min={0} step="0.01" value={v.price}
              onChange={(e) => set("price", Number(e.target.value))} />
            {err("price")}
          </div>
          <div>
            <Label>Original price</Label>
            <Input type="number" min={0} step="0.01" value={v.compare_at_price ?? ""}
              onChange={(e) => set("compare_at_price", e.target.value === "" ? null : Number(e.target.value))} />
            {err("compare_at_price")}
          </div>
          <div>
            <Label>Currency</Label>
            <select
              value={v.currency}
              onChange={(e) => set("currency", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CURRENCY_CODES.map((c) => (
                <option key={c} value={c}>{CURRENCIES[c].symbol} {c} — {CURRENCIES[c].label}</option>
              ))}
            </select>
            {err("currency")}
          </div>
          <div>
            <Label>Stock *</Label>
            <Input type="number" min={0} step="1" value={v.stock}
              onChange={(e) => set("stock", Number(e.target.value))} />
            {err("stock")}
          </div>
        </div>
        {v.compare_at_price && v.compare_at_price > v.price && (
          <p className="text-xs text-accent mt-3">
            Discount: {Math.round((1 - v.price / v.compare_at_price) * 100)}% off
          </p>
        )}
      </Card>

      <Card title="Key features & specifications">
        <ChipEditor
          label="Key features"
          value={v.features}
          input={featureInput}
          setInput={setFeatureInput}
          onChange={(next) => set("features", next)}
          placeholder="40h battery life"
        />
        <div className="mt-5 space-y-2">
          <Label>Specifications</Label>
          {Object.entries(v.specifications).map(([k, val]) => (
            <div key={k} className="flex items-center gap-2 text-sm">
              <span className="w-40 shrink-0 text-muted-foreground">{k}</span>
              <span className="flex-1">{val}</span>
              <Button type="button" size="icon" variant="ghost" className="size-8"
                onClick={() => setV((p) => {
                  const next = { ...p.specifications };
                  delete next[k];
                  return { ...p, specifications: next };
                })}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Attribute (e.g. Battery)" value={specKey} onChange={(e) => setSpecKey(e.target.value)} />
            <Input placeholder="Value (e.g. 40 hours)" value={specVal} onChange={(e) => setSpecVal(e.target.value)} />
            <Button type="button" variant="outline" onClick={() => {
              if (!specKey.trim() || !specVal.trim()) return;
              setV((p) => ({ ...p, specifications: { ...p.specifications, [specKey.trim()]: specVal.trim() } }));
              setSpecKey(""); setSpecVal("");
            }}>
              <Plus className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Attributes are free-form, so each category can use its own (RAM, Storage… for laptops; Battery, Driver… for earbuds).
          </p>
        </div>
      </Card>

      <Card title="Publish">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{v.status === "active" ? "Published" : "Not visible in the catalog"}</div>
            <p className="text-sm text-muted-foreground">Turn off to unpublish without deleting — orders and reviews stay intact.</p>
          </div>
          <Switch checked={v.status === "active"} onCheckedChange={(c) => set("status", c ? "active" : "inactive")} />
        </div>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving || uploading} className="h-11 px-6 bg-gradient-primary text-primary-foreground glow">
          {saving && <Loader2 className="size-4 animate-spin" />} {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-gradient-card border p-5 md:p-6">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ChipEditor({
  label, value, onChange, input, setInput, placeholder,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  input: string;
  setInput: (s: string) => void;
  placeholder: string;
}) {
  const add = () => {
    const t = input.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setInput("");
  };
  return (
    <div className="mt-4">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 my-2">
        {value.map((t) => (
          <button key={t} type="button" onClick={() => onChange(value.filter((x) => x !== t))}
            className="text-xs px-3 py-1 rounded-full glass hover:border-destructive/50">
            {t} ×
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={input} placeholder={placeholder} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" onClick={add}><Plus className="size-4" /></Button>
      </div>
    </div>
  );
}