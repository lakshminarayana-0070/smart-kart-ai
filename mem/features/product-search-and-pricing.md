---
name: Product Search, Discovery & International Pricing
description: Master spec for reliable product search (fix "0 products found") and shared multi-currency price formatting (INR/USD/EUR/GBP) — stored for later implementation
type: feature
---
STATUS: STORED SPEC — implement only when explicitly instructed.

## 0. Purpose
Make Smart Kart AI reliably find existing products on search, and display correct
currency symbols/locale formatting everywhere, for Indian and international customers.
Keep architecture ready for future currency conversion and AI/semantic search.
Preserve every existing system; avoid rewrites.

## 1. Critical development rule — DO NOT REBUILD
Audit first: products schema, product query functions, Search page, Home queries, PDP,
ProductCard, Wishlist, Camera Shopping, Budget Shopping, cart, checkout, seller product
management, RLS policies, existing currency fields, shared utilities/components.
Change the minimum files/logic required.
Forbidden: second products table, second cart, second checkout, replacing AI/RAG,
replacing auth, replacing RLS/security, replacing seller ownership logic, overwriting
product records unnecessarily, touching unrelated working features.
If an existing implementation already satisfies part of this spec, PRESERVE IT.

## 2. Existing architecture (already present)
products, categories, active-product status, ProductCard, Home/Search/Camera/Budget/
Wishlist product queries, PDP, cart, orders, server-side checkout pricing, auth, RLS,
seller product management, demo products already seeded.

Problem to solve: SEARCH RELIABILITY — users see "0 products found" even when matching
products exist. First responsibility is to audit and repair the EXISTING search pipeline,
not rebuild the catalog.

## 3. Search objective
Natural discovery. Examples that must work:
- "iphone" → iPhone products
- "iph" → partial match capable of returning iPhone products
- "nike" → Nike products
- "shoes" → shoe categories / shoe-related searchable info
- "laptop" → laptops; "shirt" → shirts
- "gaming laptop" → relevant gaming laptops where product info supports the match
Users must NOT need the exact full product name.

## 4. Search fields
Use existing schema. Priority: product name, brand, category, subcategory, description,
tags, keywords, features, other appropriate existing searchable metadata.
Do not invent columns. Reuse fields that exist. Only add a field if it delivers clear
value and fits the existing architecture.

## 5. Search behavior
Case-insensitive, trimmed, partial-match friendly, robust to extra spaces, safe against
malformed input, compatible with existing active-product rules, fast enough for normal
ecommerce use. "iPhone" / "iphone" / "IPHONE" behave identically.

## 6. Result prioritization
Order where practical:
1. Exact product-name match
2. Product-name partial match
3. Brand match
4. Category/subcategory match
5. Description match
6. Tags/keywords/features match
"Nike" → brand Nike ranks high. "running shoes" → explicitly categorized/described running
shoes rank above weak text matches. Avoid unnecessarily complex AI ranking when a reliable
database search solves it; keep it extensible for future semantic search.

## 7. Active product rule
Public customers receive only active/published products per existing status architecture.
Never bypass RLS, never expose unpublished seller products or deleted/inactive products,
never weaken security to make search work. If search returns zero because of an incorrect
status filter, fix the search implementation — not the security model.

## 8. Search pipeline
query → normalize → validate/trim → existing product search function → search relevant
fields → apply active-product rules → rank/order → return records → render existing
ProductCard → display result count.
Do not create a parallel pipeline if the existing one can be repaired.

## 9. Search UI
Provide: search input, search icon, clear button when appropriate, loading state, result
count, product grid, existing ProductCard, empty state, error state.
Counts read like "12 products found", "1 product found", 'No products found for "xyz"'.
Never show "0 products found" while still loading. UI must distinguish loading vs found vs
zero-results vs error.

## 10. Empty search
No query is not a failed search. Preserve/keep intended behavior: featured, popular, recent,
category browsing, or recommended products.

## 11. Search URL state
Reflect query in URL where compatible with existing routing: /search?q=iphone.
Enables refresh, sharing, back/forward, direct navigation. Do not break existing navigation.

## 12. Result count
Always derived from the actual returned dataset/query. Never hardcoded.

## 13. Performance
Avoid unnecessary DB calls. Use debouncing where needed, query limits, indexes where
appropriate, existing server functions and DB utilities. No expensive AI call per keystroke.
Autocomplete, if added later, is optimized separately.

## 14. International pricing objective
Support Indian and international customers with proper symbols and locale-aware number
formatting: ₹49,999 / $599.99 / €899.99 / £799.99.
INR MUST render as ₹ — not "INR 49999" on customer-facing price displays.

## 15. Supported currencies
| Currency | Code | Symbol | Locale |
| Indian Rupee | INR | ₹ | en-IN |
| US Dollar | USD | $ | en-US |
| Euro | EUR | € | en-GB / EU-compatible formatting |
| British Pound | GBP | £ | en-GB |
Architecture must allow more currencies later. Do not hardcode symbols across components.

## 16. Shared price formatter
Create or reuse exactly ONE shared price-formatting utility/component used by all product
price displays. It handles currency code, symbol, locale, decimal precision, thousands
separators, invalid/missing currency, and valid numeric price. Use Intl.NumberFormat, e.g.
Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).
Never do `"₹" + price` anywhere in the app.

## 17. Product price data
Preserve existing price architecture. If products already have `price` and `currency`, use
them. No duplicate pricing fields unless absolutely necessary. Every active product needs a
valid numeric price and currency code. Do not delete/overwrite existing product data; only
safely correct genuinely missing or invalid currency values on demo rows.

## 18. Currency conversion (IMPORTANT)
Display formatting and conversion are DIFFERENT features. Phase 1 = correct formatting and
symbols only. No fake conversion, no hardcoded rates like 1 USD = ₹83. Do not present a
₹49,999 product as an automatically converted $599 product.
Real conversion later must use a proper exchange-rate source and clearly separate: base
price, base currency, exchange rate, converted display price, conversion timestamp/source.
Until reliable conversion exists, never claim converted prices.

## 19. Currency selector
Add a simple global selector in an existing location (navbar, account/preferences, shopping
header). Do not redesign navigation. Options: ₹ INR, $ USD, € EUR, £ GBP. Selection persists
across navigation using existing app state/storage. No new global state library.

## 20. Default currency
Default customer-facing currency is INR (₹). International users can select another supported
currency. Geo-detection may be considered later but must not create unreliable pricing.

## 21. Price display consistency
The shared formatter is used at minimum on: Home, Search results, PDP, Wishlist, Cart, Camera
Shopping results, Budget Shopping results, and seller product previews where appropriate.
Never allow ₹49,999 on one page and INR 49999 on another for the same selected currency.

## 22. Compare-at price
Current price and original/compare-at price use the same formatter and formatting rules.
Preserve existing compare-at validation rules.

## 23. Cart and checkout safety
Do not modify server-side checkout pricing merely to implement display formatting. UI formats;
the trusted server-side logic still controls actual pricing. Never trust client-provided
formatted prices. The currency selector must not bypass server-side pricing validation or
weaken checkout security.

## 24. Seller system
Preserve existing seller product management and fields. Preserve seller currency selection if
present; if added later, integrate into the existing ProductForm — never a second seller
product system. Do not modify seller ownership/RLS for search or formatting purposes.

## 25. Product Detail Page
Must display price with correct currency symbol, compare-at/original price when available,
stock/availability, and continue using the existing product lookup, gallery, brand,
specifications, features, and not-found state. Do not break the existing PDP.

## 26. AI/search future compatibility
Architecture must not block later semantic product search, AI shopping assistant search,
natural-language queries, personalized search, RAG-assisted discovery, or hybrid keyword +
semantic search (e.g. "lightweight laptop for coding under ₹60,000"). AI search is NOT part of
this phase. Keyword search must stay reliable independently of AI.

## 27. RAG separation
Product catalog ≠ Shopping/RAG knowledge base. Catalog rows are purchasable products (price,
stock, image, brand, category). RAG knowledge is descriptive knowledge for AI answers. Do not
replace the catalog with RAG, and do not make normal product search depend on RAG.

## 28. Error handling
Handle DB errors, network failures, cancelled requests, empty results, invalid input, slow
responses. Cancelled/aborted requests from normal navigation or a newer request must not be
displayed as fatal crashes. Preserve the existing aborted-request filtering fix.

## 29. Security
Preserve auth, RLS, seller ownership, product status restrictions, storage policies,
server-side checkout pricing, and trusted server-side identity. Never fix search by disabling
RLS or making products public. Never accept seller ownership from client request data.

## 30. Database changes
Inspect schema first; reuse existing fields; migrate only when genuinely required. No duplicate
tables, no overwriting product data, preserve existing indexes/constraints. Add search indexes
only when the actual query implementation justifies it. Migrations must be backwards compatible.

## 31. Testing requirements (test the running app, not just types)
Search: exact name, partial name, brand, category, subcategory, description keyword, tags,
lowercase, uppercase, mixed case, leading/trailing spaces, empty search, nonexistent product,
multi-word query.
Price: INR, USD, EUR, GBP, decimals, large prices, compare-at, missing/invalid currency.
UI: result count, cards, images, names, prices, symbols, loading, empty, error, URL state,
currency persistence.
Regression: Home, PDP, cart, checkout, wishlist, Camera Shopping, Budget Shopping, AI assistant,
RAG, Knowledge Base, seller dashboard, seller product management, auth, RLS.

## 32. Acceptance criteria
Search: existing product found; partial searches return relevant products; brand and category
searches work; case-insensitive; whitespace tolerant; no incorrect zero results; accurate count;
clear empty state; active-product restrictions enforced.
Pricing: ₹/$/€/£ render correctly with locale formatting; prices consistent app-wide; checkout
pricing stays secure; no fake exchange-rate conversion.
Architecture: no duplicate product table/cart/checkout; no unnecessary replacements; RAG, AI,
seller system, and RLS intact.

## 33. Implementation principle
AUDIT → REUSE → FIX → EXTEND → TEST (never REBUILD → REPLACE → RISK).
Improve an existing function that does 80% of the work rather than writing a replacement.
Connect existing price components to the shared formatter instead of duplicating them.
Reuse the existing currency field. Fix an almost-correct search query.

## 34. Final implementation report (required after building)
Root cause of the "0 products found" issue; search architecture used; search fields supported;
number of existing products verified; example searches tested and results; shared price formatter
created or reused; supported currencies; whether conversion was implemented or deferred; database
migrations if any; files changed; security/RLS preserved; regression tests completed; remaining
limitations.

## 35. Future extensions
Phase 2 Advanced Search: autocomplete, suggestions, search history, trending searches, typo
tolerance, synonyms.
Phase 3 AI Search: natural-language queries, semantic search, hybrid keyword + vector, AI ranking.
Phase 4 Smart Currency: live exchange rates, regional detection, currency-aware seller pricing and
checkout, exchange-rate timestamps.
Phase 5 Personalized Discovery: preferences, shopping history, budget, previous searches,
personalized ranking.
Add incrementally without compromising catalog, checkout, RAG, AI, or security.

## Final rule
Change nothing unrelated; don't rebuild, delete products, duplicate tables/logic, weaken RLS,
break cart/checkout, or replace AI/RAG. Inspect first, identify what is missing or broken, then
make the smallest safe changes. The result must feel like one unified platform.
