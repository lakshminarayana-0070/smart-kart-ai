---
name: Database architecture
description: Scalable entities to model when backend phase begins
type: feature
---
Entities (scalable Postgres/Supabase via Lovable Cloud):
- users, user_roles (separate table — never store roles on users/profiles)
- sellers
- products, categories
- orders, order_items, payments
- reviews
- recommendations (cached/derived)
- ai_generated_content (descriptions, marketing, replies — auditable)
- analytics (events, aggregates)
- wishlist, cart, cart_items
- search_history
- user_preferences
- ai_usage (requests, tokens, cost, latency)

Use RLS on all user-scoped tables. Roles via has_role() security-definer fn pattern.
