# Project Memory

## Core
Project: **Smart Kart AI** — AI-first futuristic ecommerce ecosystem (NOT a basic ecommerce app). Always treat as premium, futuristic, AI-themed, scalable, production-ready.
Two core modules: (1) Customer AI Commerce Platform, (2) AI Seller & Admin Intelligence Platform.
Stack: React + TypeScript + Tailwind + TanStack Start + Lovable Cloud (Supabase/Postgres) + OpenAI/Lovable AI Gateway + vector search.
Design: futuristic, premium gradients, AI glow effects, minimal, dark/light ready, smooth animations. Never generic ecommerce look.
DO NOT build anything until user explicitly requests a phase. Memory-only intake right now.
All customer-facing prices go through ONE shared currency formatter (Intl.NumberFormat). Default INR (₹). Never fake exchange-rate conversion.
Existing system — inspect and reuse before adding. No duplicate tables/functions/routes, no redesigns, no weakening RLS, small controlled changes.
Follow the fixed 11-phase development order; never jump phases.

## Memories
- [Project vision & scope](mem://features/smart-kart-ai-overview) — Vision, tone, treat-as rules, non-goals
- [Module 1: Customer platform](mem://features/module-1-customer) — Auth, landing, home, AI rec, smart search, PDP, review analyzer, camera shopping, budget assistant, cart/checkout, dashboard
- [Module 2: Seller & admin](mem://features/module-2-seller-admin) — Seller dashboard, AI description/marketing/reply generators, inventory, orders, analytics, admin panel, AI usage monitoring, security
- [AI systems](mem://features/ai-systems) — 7 AI subsystems: recommendation, review analysis, content gen, customer reply, budget, camera, smart search
- [Database architecture](mem://features/database-architecture) — Entities to model when backend phase begins
- [Future scalability roadmap](mem://features/future-roadmap) — Chatbot, voice commerce, AR, virtual try-on, dynamic pricing, trend prediction, personal shopper, fashion matching, inventory forecasting
- [Camera Product Search](mem://features/camera-product-search) — Future vision AI camera shopping pipeline with product matching, RAG enrichment, and fallback flows
- [Group 1 — Product Foundation](mem://features/group-1-product-foundation) — Product Catalog + Seller Product Management + Product Detail Experience
- [Product Search & International Pricing](mem://features/product-search-and-pricing) — Fix "0 products found" search pipeline, ranking, shared INR/USD/EUR/GBP price formatter, currency selector
- [Design vision](mem://design/visual-direction) — Futuristic AI aesthetic, gradients, glow, premium typography, dark/light
