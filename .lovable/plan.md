# Smart Kart AI — Group 1 Product Foundation (Memory Storage Only)

This is a non-implementation task. The goal is to store the complete `Group 1 — Product Foundation` specification in the project's persistent memory (`mem://`) so it can be used as the source of truth when the user later says:

> "Implement Smart Kart AI Group 1."

## What this plan does

1. Create `mem/features/group-1-product-foundation.md` containing the full Group 1 specification.
2. Update `mem/index.md` to add a reference to the new memory file.
3. Update `mem/features/future-roadmap.md` to list Group 1 as a planned implementation phase.

## What this plan does NOT do

- No code changes.
- No new routes, components, APIs, or database tables.
- No migrations, RLS changes, package installs, or deployments.
- No modifications to existing Camera Shopping, RAG, checkout, authentication, security, or UI.
- No product seeding or data changes.

## Storage trigger

When the user later explicitly requests implementation, retrieve this specification from memory first, then audit the existing product catalog, seller product management, and product detail page before making any changes.
