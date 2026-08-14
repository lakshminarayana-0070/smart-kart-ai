/**
 * Smart Kart AI — keyword product search + ranking (no AI calls).
 * Kept independent of RAG so normal search always works.
 * Designed so a semantic/vector layer can be added on top later.
 */

export type SearchableProduct = {
  id: string;
  name: string;
  brand?: string | null;
  sku?: string | null;
  description?: string | null;
  tags?: unknown;
  features?: unknown;
  specifications?: unknown;
  category?: { name?: string | null } | null;
  subcategory?: { name?: string | null } | null;
  rating?: number | null;
  review_count?: number | null;
};

export const normalizeQuery = (q: string) => q.replace(/\s+/g, " ").trim().toLowerCase();

export const tokenize = (q: string) => normalizeQuery(q).split(" ").filter(Boolean);

const asStrings = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  if (v && typeof v === "object") {
    return Object.entries(v as Record<string, unknown>).flatMap(([k, val]) =>
      typeof val === "string" ? [k, val] : [k],
    );
  }
  return [];
};

type Fields = {
  name: string;
  brand: string;
  category: string;
  description: string;
  keywords: string;
};

const fieldsOf = (p: SearchableProduct): Fields => ({
  name: (p.name ?? "").toLowerCase(),
  brand: `${p.brand ?? ""} ${p.sku ?? ""}`.toLowerCase(),
  category: `${p.category?.name ?? ""} ${p.subcategory?.name ?? ""}`.toLowerCase(),
  description: (p.description ?? "").toLowerCase(),
  keywords: [...asStrings(p.tags), ...asStrings(p.features), ...asStrings(p.specifications)]
    .join(" ")
    .toLowerCase(),
});

/** Higher is better. 0 means the token matched nothing. */
function scoreToken(f: Fields, token: string, fullQuery: string): number {
  if (f.name === fullQuery) return 1000;
  if (f.name.startsWith(token)) return 220;
  if (f.name.includes(token)) return 180;
  if (f.brand.includes(token)) return 140;
  if (f.category.includes(token)) return 110;
  if (f.description.includes(token)) return 70;
  if (f.keywords.includes(token)) return 50;
  return 0;
}

export type RankedProduct<T extends SearchableProduct> = T & { _score: number };

/**
 * Filters + ranks a product list against a free-text query.
 * A product matches when EVERY token matches at least one searchable field,
 * so multi-word queries ("gaming laptop") stay meaningful.
 */
export function rankProducts<T extends SearchableProduct>(products: T[], rawQuery: string): T[] {
  const query = normalizeQuery(rawQuery);
  if (!query) return products;
  const tokens = tokenize(query);

  const scored: RankedProduct<T>[] = [];
  for (const p of products) {
    const f = fieldsOf(p);
    let total = 0;
    let matchedAll = true;
    for (const t of tokens) {
      const s = scoreToken(f, t, query);
      if (s === 0) {
        matchedAll = false;
        break;
      }
      total += s;
    }
    if (!matchedAll) continue;
    // whole-phrase bonus keeps "gaming laptop" ahead of "gaming" + "laptop" scattered
    if (f.name.includes(query)) total += 150;
    else if (`${f.brand} ${f.category} ${f.description}`.includes(query)) total += 60;
    total += Math.min(Number(p.rating ?? 0), 5) * 2;
    scored.push({ ...(p as T), _score: total });
  }

  return scored
    .sort((a, b) => b._score - a._score || Number(b.review_count ?? 0) - Number(a.review_count ?? 0))
    .map(({ _score, ...rest }) => rest as unknown as T);
}
