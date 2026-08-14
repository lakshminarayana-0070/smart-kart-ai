---
name: Future scalability roadmap
description: AI features the architecture must remain ready for
type: feature
---
Architecture must remain extensible for:
- AI Shopping Assistant Chatbot
- AI Voice Commerce
- AR Shopping
- Virtual Try-On
- AI Dynamic Pricing
- AI Trend Prediction
- AI Personal Shopper
- AI Fashion Matching
- AI Inventory Forecasting
- Camera Product Search (vision-based catalog matching; see mem://features/camera-product-search for full spec)

Implementation phases to track:
- Group 1 — Product Foundation (product catalog, seller product management, product detail experience; see mem://features/group-1-product-foundation for full spec)
- Product Search, Discovery & International Pricing (repair search pipeline, ranking, shared multi-currency formatter, currency selector; see mem://features/product-search-and-pricing for full spec) — queued, not implemented

Keep modules decoupled and AI calls abstracted behind a service layer so new AI capabilities slot in without refactors.
