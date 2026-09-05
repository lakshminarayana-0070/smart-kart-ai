# Smart Kart AI — Roadmap

Fixed phase order (from Day 1 audit): 1 DB+security+auth · 2 core ecommerce · 3 AI shopping · 4 reviews+review AI · 5 RAG+customer reply · 6 marketing gen · 7 seller platform · 8 admin platform · 9 camera shopping · 10 personalization · 11 testing/security/perf/polish.

## Done
- [x] Day 1 audit & architecture baseline (2026-08-25)
- [x] Day 1 build: core database foundation (reviews, seller_profiles, order lifecycle, validation, seller/admin read access) (2026-09-05)

## Up next
- [ ] Structured master plan of the whole application (requested 2026-09-05)
- [ ] Verify checkout → orders end-to-end with a real signed-in session (orders table still 0 rows)
- [ ] Backfill `brand` on the 12 demo products (brand-style searches return 0 results)
- [ ] Validate/trim knowledge text before embedding so "Invalid input for embedding" cannot surface

## Queued (phase order)
- [ ] Phase 2 finish: search filters (price/category/brand/rating/stock), profile + saved address page
- [ ] Phase 3: AI shopping (NL catalog search, budget AI, recommendations)
- [ ] Phase 4: reviews UI + review analyzer AI (table now exists)
- [ ] Phase 5–6: RAG demos (seed real knowledge rows), marketing generator polish
- [ ] Phase 7: seller orders, inventory logic, analytics
- [ ] Phase 8: admin platform (role assignment path + has_role policies in UI)
- [ ] Phase 9: camera AI (needs vision strategy decision)
- [ ] Phase 10: personalization
- [ ] Phase 11: testing, security, performance, polish
