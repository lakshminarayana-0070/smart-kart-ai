---
name: Incremental development rules
description: How the user wants all Smart Kart AI work done — inspect first, reuse, small controlled changes, no redesigns
type: preference
---
Treat Smart Kart AI as an existing software system built in small daily tasks. **How to apply:**
- Inspect existing code before every change; reuse existing components, helpers, server functions, tables, and the existing RAG chain.
- Never create duplicate tables, functions, routes, or components. Check for an equivalent first.
- Never redesign working pages, remove functionality, or weaken RLS without explicit confirmation.
- Prefer small controlled changes over rewrites. Test/verify existing behaviour before changing it.
- Keep customer / seller / admin permissions strictly separated. Never expose keys or secrets in frontend code.
- Never mark a feature complete because a UI screen exists — only when the main flow works end-to-end. Otherwise say PARTIAL or UNVERIFIED.
- Follow the fixed phase order in mem://features/audit-baseline-day1; don't jump phases.
