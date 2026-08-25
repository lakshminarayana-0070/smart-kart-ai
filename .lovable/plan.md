# Day 1 — Smart Kart AI Audit & Architecture Baseline

Verified by reading the routes/components/server functions and querying the live database. No code, schema, or UI changes proposed today. Anything I could not prove end-to-end is marked PARTIAL or UNVERIFIED, not COMPLETE.

## 1. Architecture as it exists

- TanStack Start (React 19 + Vite, SSR/edge), Tailwind v4, shadcn UI.
- Backend logic through `createServerFn` (no edge functions). Auth-gated functions use `requireSupabaseAuth`; bearer token attached client-side in `src/start.ts`.
- Data: Lovable Cloud Postgres, pgvector enabled. Storage bucket `product-images` (private, signed URLs).
- AI: Lovable AI Gateway (`google/gemini-3-flash-preview`) via `src/ai/openai.server.ts`. Embeddings call Gemini directly (`text-embedding-004`, 768-dim, fallback `gemini-embedding-001`).
- Auth gate: `src/routes/_authenticated.tsx` is a client-side `useEffect` redirect, not the integration-managed `ssr:false` layout gate.

## 2. Routes / pages

Public: `/` landing, `/login`, `/signup`.
Authenticated: `/home`, `/search`, `/product/$slug`, `/cart`, `/checkout`, `/orders`, `/wishlist`, `/dashboard`, `/camera`, `/budget`, `/assistant`, `/studio`, `/knowledge`, `/shopping-memory`, `/seller/products`, `/seller/products/new`, `/seller/products/$id/edit`.
API route: `/api/ai/chat` (SSE streaming).
Missing entirely: any `/admin/*` route, profile/address page, category browse page, reviews surface, seller orders/analytics.

## 3. Database (actual, live)

Tables: `profiles`(4), `user_roles`(0 admins), `products`(12 active), `categories`(16), `cart_items`(3), `wishlist`(0), `orders`(0), `order_items`(0), `search_history`(81), `recently_viewed`, `ai_chats`(16), `ai_messages`, `ai_generations`(7), `smart_kart_ai_knowledge`(0 rows, 0 embeddings).
No `reviews` table, no `product_images` table (images live in `products.images` JSONB), no `seller_profiles` (seller identity = `products.seller_id`), no recommendations/analytics tables.
Functions/RPCs: `handle_new_user`, `has_role`, `match_memory`, `update_updated_at_column`. Triggers: `on_auth_user_created`, `updated_at` on `products` and knowledge.

## 4. Feature status

**Customer**
- 🟢 Landing, auth (email + Google, auto profile + `customer` role), product browsing/home feed, keyword search + ranking, PDP, currency formatter/selector, cart, wishlist.
- 🟡 Checkout / orders: server-side `placeOrderFn` recomputes totals with service role and RLS now blocks client writes — but `orders` = 0 rows, so the flow is UNVERIFIED end-to-end.
- 🟡 Dashboard: counts only, no profile editing, no saved address (checkout collects address into `orders.shipping_address` only).
- 🟠 Advanced filtering: no price/category/brand/rating/stock filters anywhere — only free-text ranking.
- 🟠 Smart Camera Shopping: real camera capture + upload works, but "matches" is `products.select().limit(6)` — no image analysis, no embedding, no similarity. The AI claim in the UI is not backed by logic.
- 🟠 AI Budget Shopping: greedy `price <=` bundle, no AI call.
- ⚪ Reviews & ratings (`rating`/`review_count` are static columns), product comparison, personalized recommendations (home feed is `is_trending`/`is_featured` flags).
- 🟡 AI natural-language search: `/search` is purely lexical; the assistant chat is separate and cannot filter the catalog.

**Seller**
- 🟢 Product list, create, edit, publish/unpublish, image upload, RLS scoped to `seller_id`.
- 🟡 Inventory: `stock` is an editable field, no low-stock logic or movement history.
- ⚪ Seller orders, order status management, sales analytics, product performance, review insights.
- 🟢 AI description / marketing / customer-reply generators (in `/studio`, logged to `ai_generations`).

**Admin** — ⚪ Everything. `app_role` enum has `admin` and `has_role()` exists, but no admin route, no admin UI, no policy uses `has_role`, and zero admin rows exist.

**AI systems**
1. Recommendation ⚪ 2. NL search 🟡 (chat only) 3. Budget 🟠 4. Comparison ⚪ 5. Review analyzer 🔵 (server fn + Studio tab, but no reviews in DB to feed it) 6. Customer reply 🟢+RAG 7. Marketing 🟢+RAG 8. Camera 🟠 9. RAG 🟡 10. Personalization ⚪.

## 5. RAG — preserved, correct, but empty

The full chain exists and matches the intended flow: `buildSearchQuery` → `generateEmbedding` (RETRIEVAL_QUERY) → `match_memory` RPC → `formatRetrievedContext` → `buildRagPrompt` → gateway, with additive `_rag` metadata, `RagBadge`, `NoMemoryBanner`, and non-blocking fallback on retrieval failure. RLS restricts knowledge to `auth.uid()`.
Root cause of "no RAG results": `smart_kart_ai_knowledge` has **0 rows and 0 embeddings**. Retrieval is behaving correctly; there is simply nothing to retrieve. Not a bug.

## 6. Known issues — findings

- **"0 products found"**: the old `.or(ilike)` query was replaced by a cached catalog fetch + client-side multi-field ranking. Cause was the single raw `or()` on name/description with no normalization. Current risk: ranking requires *every* token to match, and all 12 products have `brand = NULL`, so brand-style queries return zero. Also capped at 500 rows in memory.
- **"Invalid input for embedding"**: thrown by `embeddings.server.ts` for empty/blank text and for Gemini HTTP 400. Reachable when a knowledge entry is saved with effectively empty content. Needs input trimming/validation at the call sites rather than surfacing the raw message.
- Auth gate pattern differs from the recommended managed `_authenticated/route.tsx` (`ssr:false`), which can flash "Loading…" on hard refresh.
- `has_role` is dead code today — the admin permission model is declared but unenforced.
- No error/not-found components on most routes; several pages have no explicit error state (`/search` does).

## 7. Blockers for the phase plan

- Phase 4 (reviews) is blocked: no `reviews` table, so ratings, review AI, and seller review insights have nothing to read.
- Phase 8 (admin) is blocked: no admin role assignment path and no `has_role`-based policies.
- Phase 7 (seller orders/analytics) is blocked: `orders` has zero rows and no seller-scoped read policy on `orders`/`order_items`.
- Camera AI is blocked on a vision/embedding strategy decision (image embeddings vs. label-then-search).
- RAG demos are blocked on seeding real knowledge rows.

## 8. Recommended next step (Day 2)

Stay in Phase 1/2 order and do the smallest high-value verification work:

1. Verify the checkout → orders flow end-to-end in the browser with a real signed-in session and confirm one order + order_items row lands correctly (currently zero orders exist).
2. Fix the two concrete search/embedding weaknesses: backfill `brand` on the 12 demo products and validate/trim knowledge text before embedding so "Invalid input for embedding" cannot reach the user.
3. Then move to Phase 2 completion: filters (price/category/brand/rating/stock) on `/search` and a profile + saved-address surface.

Reviews (Phase 4) and admin (Phase 8) come later, in the stated order, and each will need one small additive migration when we reach them.

## 9. Rules I will carry forward

Reuse existing components, helpers, RAG chain, and tables. No duplicate tables/functions/routes. No redesigns. No weakening of RLS. Small controlled changes, verified before being called done.
