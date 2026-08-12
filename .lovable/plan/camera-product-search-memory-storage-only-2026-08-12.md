# Camera Product Search — Memory Storage Only

This is a non-implementation task. The goal is to store the complete `Camera Product Search` future-feature specification in the project's persistent memory (`mem://`) so it can be used as the source of truth when the user later says:

> "Implement Camera Product Search using the stored Smart Kart AI specification."

## What this plan does

1. Create `mem/features/camera-product-search.md` containing the full specification.
2. Update `mem/index.md` to add a reference to the new memory file.
3. Update `mem/features/future-roadmap.md` to list Camera Product Search as a future extensibility item.

## What this plan does NOT do

- No code changes.
- No new routes, components, APIs, or database tables.
- No modifications to the existing Camera Shopping page (`src/routes/_authenticated/camera.tsx`).
- No package installs, environment variables, or deployments.
- No UI changes of any kind.

## Storage trigger

When the user later explicitly requests implementation, retrieve this specification from memory first, then inspect the existing Camera Shopping implementation, product search infrastructure, AI/vision integrations, product database/schema, and RAG infrastructure before making any changes.
