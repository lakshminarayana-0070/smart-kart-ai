import { Search, X, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type KnowledgeCategory } from "@/lib/knowledge";
import { cn } from "@/lib/utils";

export type SortKey = "updated" | "created" | "title";

export function KnowledgeFilters({
  query, onQuery, category, onCategory, sort, onSort,
}: {
  query: string; onQuery: (q: string) => void;
  category: KnowledgeCategory | "all"; onCategory: (c: KnowledgeCategory | "all") => void;
  sort: SortKey; onSort: (s: SortKey) => void;
}) {
  const hasFilters = query || category !== "all" || sort !== "updated";
  return (
    <div className="rounded-2xl glass ai-border p-3 space-y-3">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search title, content, tags…"
            className="pl-9 bg-transparent border-white/10"
          />
        </div>
        <Select value={category} onValueChange={(v) => onCategory(v as KnowledgeCategory | "all")}>
          <SelectTrigger className="md:w-56 bg-transparent border-white/10">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => onSort(v as SortKey)}>
          <SelectTrigger className="md:w-44 bg-transparent border-white/10">
            <ArrowUpDown className="size-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="created">Recently created</SelectItem>
            <SelectItem value="title">Title A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => onCategory("all")}
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] border transition",
            category === "all" ? "bg-primary/15 border-primary/40 text-primary" : "border-white/10 text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => onCategory(c.value)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] border transition",
              category === c.value ? "bg-accent/15 border-accent/40 text-accent" : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            {c.emoji} {c.label}
          </button>
        ))}
        {hasFilters && (
          <Button
            variant="ghost" size="sm"
            onClick={() => { onQuery(""); onCategory("all"); onSort("updated"); }}
            className="ml-auto h-7 text-xs"
          >
            <X className="size-3 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}