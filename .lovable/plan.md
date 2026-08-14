# Store: Product Search, Discovery & International Pricing spec (memory only)

This is a storage task. No code, database, or UI changes.

## What gets saved

Create `mem://features/product-search-and-pricing` holding the full master specification:

- **Critical rule** — audit before changing; no duplicate products table, cart, checkout, auth, RLS, or AI/RAG systems.
- **Search objective** — exact, partial, brand, category, and multi-word queries must return matching products; the current "0 products found" bug is a search-pipeline repair task, not a catalog rebuild.
- **Search fields** — name, brand, category, subcategory, description, tags, features, keywords where present. No invented columns.
- **Search behavior** — case-insensitive, trimmed, partial-match friendly, malformed-input safe.
- **Ranking order** — exact name, name partial, brand, category/subcategory, description, tags/features.
- **Active product rule** — only published/active products for customers; never weaken RLS to fix search.
- **Pipeline** — normalize, validate, query existing function, apply active rules, rank, render existing ProductCard, show count.
- **Search UI** — input, clear, loading, count, grid, empty state, error state; never show "0 products found" while loading.
- **Empty query** — preserve existing featured/popular/recommended behavior.
- **URL state** — `/search?q=...` where compatible with existing routing.
- **Performance** — debounce, limits, indexes only when justified; no AI call per keystroke.
- **International pricing** — INR ₹ (default), USD $, EUR €, GBP £; locale-aware formatting via `Intl.NumberFormat`.
- **One shared formatter** — every price surface (Home, Search, PDP, Wishlist, Cart, Camera, Budget, seller previews, compare-at) uses it; no inline `"₹" + price`.
- **No fake conversion** — Phase 1 is display formatting only; hardcoded exchange rates forbidden.
- **Currency selector** — simple global selector in an existing location, persisted, no nav redesign, no new state library.
- **Cart/checkout safety** — server-side trusted pricing untouched; selector never influences charged amounts.
- **Seller system, PDP, security, RAG separation** — all preserved as-is.
- **Database rules** — reuse `price`/`currency`; migrations only when genuinely required; backwards compatible.
- **Testing matrix** — search cases, price cases, UI states, and the full regression list.
- **Acceptance criteria** and **future phases** (advanced search, AI/semantic search, smart currency, personalized discovery).
- **Implementation principle** — AUDIT → REUSE → FIX → EXTEND → TEST.
- **Final report requirements** — root cause, architecture, fields, tested searches, formatter, currencies, migrations, files changed, security preserved, limitations.

## Index updates

- Add the new entry to `mem://index.md` under Memories.
- Add a Core line: prices always go through the shared currency formatter; INR is default; no fake conversion.
- Note the spec in `mem://features/future-roadmap` as a queued implementation group.

## Not doing now

No search fix, no formatter utility, no currency selector, no migration. Those happen only when you explicitly say to implement.
