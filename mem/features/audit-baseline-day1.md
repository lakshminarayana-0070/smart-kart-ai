---
name: Day 1 audit baseline & phase order
description: Verified feature status baseline (Aug 2026), known issues, blockers, and the fixed 11-phase development order for Smart Kart AI
type: feature
---
Full report: `.lovable/plan/day-1-smart-kart-ai-audit-architecture-baseline-2026-08-25.md`

Verified baseline (Aug 25 2026):
- Complete: auth (email+Google), landing/home, keyword search + ranking, PDP, cart, wishlist, currency formatter, seller product CRUD + images + publish toggle, AI description/marketing/customer-reply generators.
- Partial/unverified: checkout→orders (orders table has 0 rows; never proven end-to-end), dashboard (counts only), NL search (chat only, cannot filter catalog), inventory (stock field only), RAG (chain correct but smart_kart_ai_knowledge is empty).
- UI-only: camera "matches" is `products.select().limit(6)` — no vision/embedding; budget bundle is a greedy price filter with no AI.
- Missing: reviews (no reviews table), product comparison, personalized recommendations, profile/saved address, category browse page, seller orders/analytics, entire admin platform.

Known issues:
- All 12 products have brand = NULL; ranking requires every token to match, so brand-style queries return 0 results.
- "Invalid input for embedding" comes from empty/blank text or Gemini HTTP 400 in embeddings.server.ts; validate/trim before calling.
- `has_role()` exists but is unused — admin permissions declared, not enforced.
- Auth gate is a client `useEffect` redirect in `_authenticated.tsx`, not the managed ssr:false layout gate.

Blockers: reviews phase needs a reviews table; admin phase needs role assignment + has_role policies; seller orders/analytics needs real orders + seller-scoped read policies; camera AI needs a vision strategy decision.

Fixed phase order (do not jump around):
1 DB+security+auth · 2 core ecommerce · 3 AI shopping · 4 reviews+review AI · 5 RAG+customer reply · 6 marketing gen · 7 seller platform · 8 admin platform · 9 camera shopping · 10 personalization · 11 testing/security/perf/polish.
