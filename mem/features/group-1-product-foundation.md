---
name: Group 1 — Product Foundation
description: Product Catalog + Seller Product Management + Product Detail Experience
type: feature
---

# Smart Kart AI — Group 1 Master Specification

## 1. Group 1 Objective

Group 1 is the **Product Foundation** phase of Smart Kart AI.

The goal is to ensure that Smart Kart AI has a reliable, structured, single-source-of-truth product system that can support:

- Customer shopping
- Product discovery
- Smart Search
- Camera Product Matching
- Budget AI
- Recommendations
- Review Intelligence
- AI Assistant
- Seller AI
- Orders
- Cart
- Checkout

Group 1 consists of exactly three major areas:

1. Product Catalog Foundation
2. Seller Product Management
3. Product Detail Experience

**Important:** These are NOT necessarily new features. When Group 1 is eventually implemented, the existing application must be audited first. The implementation must preserve everything that already works.

## 2. Global Implementation Principle

When this specification is eventually implemented:

**AUDIT FIRST.**

The implementation process must be:

```text
Existing implementation
        ↓
Inspect current code/database/UI
        ↓
Identify what already works
        ↓
Identify what is incomplete
        ↓
Identify what is broken
        ↓
Implement only missing/broken/incomplete functionality
        ↓
Preserve existing functionality
        ↓
Test
        ↓
Report exact changes
```

- NEVER rebuild an existing working system unnecessarily.
- NEVER create duplicate functionality.
- NEVER create duplicate database tables.
- NEVER create duplicate product systems.
- NEVER replace working components without a technical reason.
- NEVER modify unrelated features.

## 3. Existing Smart Kart AI Systems to Protect

When Group 1 is eventually implemented, preserve the existing Smart Kart AI systems unless a direct dependency requires a minimal change.

Already-established systems include:

- Smart Kart AI architecture
- Existing customer platform
- Existing seller/admin architecture
- Existing product/search infrastructure
- Smart Search
- Camera Shopping
- Camera Open Camera flow
- Camera live preview
- Camera capture
- Camera retake
- Camera cancel
- Camera permission handling
- Camera fallback/upload flow
- Camera stream cleanup
- Budget AI
- AI Assistant
- AI Studio
- Knowledge Base
- Memory
- RAG infrastructure
- `smart_kart_ai_knowledge`
- `pgvector`
- `match_memory`
- `buildSearchQuery()`
- `searchMemoryFn()`
- `buildRagPrompt()`
- Email Composer Reply RAG
- `RagBadge`
- `NoMemoryBanner`
- Existing authentication
- Existing checkout
- Server-side checkout pricing/security
- Existing security architecture

The automated security scan has already reported:

- Backend security scan: 0 findings
- Database linter: 0 findings
- Dependency audit: 0 findings

These security improvements must not be weakened or unnecessarily replaced.

## 4. Part 1 — Product Catalog Foundation

When implemented later, first inspect the current product database and catalog architecture.

Determine:

- Existing product table/table name
- Existing product schema
- Existing product fields
- Existing category structure
- Existing seller relationship
- Existing image storage
- Existing pricing
- Existing inventory/stock
- Existing rating/review information
- Existing product attributes
- Existing product status
- Existing search metadata
- Existing product queries
- Existing product components
- Existing product cards

**DO NOT** create a new product table if an appropriate product table already exists.
**DO NOT** duplicate existing fields.
Only add genuinely missing functionality.

The product system should support, where applicable:

### Identity

- Product ID
- Product name
- SKU if already supported
- Brand

### Classification

- Category
- Subcategory
- Product type
- Tags

### Content

- Description
- Key features
- Specifications
- Attributes

### Media

- Product images
- Primary/featured image
- Additional images where supported

### Commerce

- Current price
- Original price
- Discount
- Currency
- Stock quantity
- Availability
- Product status

### Social Proof

- Rating
- Review count

### Ownership

- Seller ID / product owner

### AI/Search Context

- Structured product information usable by existing AI/search systems

The existing product database must remain the **SINGLE SOURCE OF TRUTH**.

Do not create separate catalogs for:

- Camera AI
- Budget AI
- Recommendations
- Smart Search
- AI Assistant

All of these should eventually use the same product source.

## 5. Product Categories

When implemented later, inspect the existing category system first.

If categories already exist and work:

**PRESERVE THEM.**

If categorization is incomplete, improve it only where necessary.

The product catalog should support reliable classification.

Example structure:

```text
Electronics
    Phones
    Laptops
    Earbuds
    Headphones
    Smartwatches
Fashion
    Shoes
    Clothing
    Accessories
Home
    Appliances
    Furniture
    Kitchen
```

This is only an example. Do not force this exact structure if the existing application already has an appropriate category system.

The critical requirement is:

**Every product should have reliable category/subcategory information where applicable.**

This is especially important for future Camera Product Matching.

Example:

```text
Camera detects:
Wireless Earbuds
        ↓
Relevant category
        ↓
Earbuds
        ↓
Similar catalog products
```

rather than searching unrelated categories.

## 6. Product Images

When implemented later, inspect the existing image upload/storage system.

If it already works:

**DO NOT REPLACE IT.**

The product system should support:

- Primary product image
- Additional product images where supported
- Image preview
- Correct product-image association
- Image replacement during editing
- Graceful image fallback

Reuse existing storage infrastructure. Do not introduce a second image-storage system.

## 7. Part 2 — Seller Product Management

When implemented later, inspect the existing Seller/Admin product management system.

If Add Product already exists:

**IMPROVE ONLY WHAT IS MISSING.**

If it does not exist:

**IMPLEMENT IT.**

Seller product workflow should eventually support:

```text
Seller Dashboard
    ↓
Add Product
    ↓
Product Information
    ↓
Category
    ↓
Images
    ↓
Price
    ↓
Stock
    ↓
Specifications
    ↓
Preview
    ↓
Publish
```

## 8. Add Product

The existing Add Product form should eventually support the required fields already compatible with the current schema.

### Basic

- Product name
- Brand
- Description

### Classification

- Category
- Subcategory
- Tags

### Pricing

- Current price
- Original price
- Discount
- Currency

### Inventory

- Stock quantity
- Availability

### Media

- Product images
- Primary image

### Specifications

- Product specifications
- Category-specific attributes where supported

Do not force identical specifications onto every product category.

For example:

**Laptop:**

- RAM
- Storage
- Processor
- Screen size

**Earbuds:**

- Battery life
- Connectivity
- Driver
- Noise cancellation

Reuse any existing dynamic-attribute system.

## 9. Product Validation

When implemented later, ensure appropriate validation for:

- Required product name
- Valid price
- Valid stock
- Valid category
- Valid discount
- Valid image where required
- No negative price
- No negative stock
- Valid pricing relationship

Where original price is used:

```text
Original Price >= Current Price
```

Do not allow invalid product data.

## 10. Product Editing

Seller should eventually be able to edit products they own.

Editable information may include:

- Product name
- Brand
- Description
- Images
- Category
- Subcategory
- Price
- Discount
- Stock
- Specifications
- Attributes
- Tags
- Status

Changes must persist correctly. Updated information must become available to the existing:

- Product catalog
- Product detail page
- Search
- AI systems

## 11. Product Deactivation / Deletion

Inspect existing deletion behavior before implementation.

Prefer safe deactivation/unpublishing when products may already be referenced by:

- Orders
- Reviews
- Cart items
- AI interactions

Do not break historical order information.

If soft-delete/deactivation already exists:

**PRESERVE IT.**

Do not introduce another deletion system.

## 12. Seller Ownership and Security

Seller ownership must be preserved.

Expected behavior:

```text
Seller A
    ↓
Can create/manage Seller A products

Seller B
    ↓
Can create/manage Seller B products

Seller A
    X
Cannot edit Seller B products
```

Use the existing authentication and RLS architecture.

- Do not weaken existing RLS.
- Do not expose service-role credentials to the browser.
- Do not replace working security policies unnecessarily.

## 13. Part 3 — Product Detail Page

When Group 1 is implemented later, inspect the current Product Detail Page first.

If it already works:

**DO NOT REBUILD IT.**

Only complete missing functionality.

The Product Detail Page should eventually provide:

### Product Media

- Main image
- Additional images where available
- Image navigation

### Product Information

- Product name
- Brand
- Description
- Key features
- Specifications

### Commerce

- Current price
- Original price
- Discount
- Currency
- Availability
- Stock information

### Social Proof

- Rating
- Review count
- Existing reviews

### Seller

- Seller information where supported

### Actions

- Add to Cart
- Wishlist where supported
- Buy/Checkout where supported

## 14. Product Detail → Cart

The Product Detail Page must use the **EXISTING** cart system.

Expected:

```text
Product Detail
      ↓
Add to Cart
      ↓
Existing Cart
      ↓
Existing Checkout
```

- DO NOT create a second cart implementation.
- DO NOT create client-authoritative checkout pricing.
- Preserve existing server-side checkout pricing/security.

## 15. Product Detail → AI

Group 1 does NOT implement new AI algorithms.

However, product information must be structured well enough for existing and future AI systems to use it.

The same product data should eventually support:

- Smart Search
- Camera Product Matching
- Budget AI
- Recommendations
- Review Intelligence
- AI Assistant
- Seller AI

Do not create AI-specific duplicate product data.

## 16. Product Cards

Inspect the existing product card component.

If it already works:

**PRESERVE IT.**

It should be capable of displaying, where applicable:

- Product image
- Product name
- Price
- Discount
- Rating
- Review count
- Availability
- Existing AI match indicators

Do not redesign the entire application during Group 1.

The complete visual redesign is reserved for Group 7.

## 17. Currency

When implemented later, inspect the existing currency configuration.

Do not blindly convert product values.

Determine whether the current system uses:

- INR
- USD
- Another configured currency

Maintain consistency across:

- Products
- Product Details
- Cart
- Checkout
- Orders

If the project is configured for INR, the customer-facing experience should consistently use `₹`.

Do not modify financial values without inspecting the existing data model and business logic.

## 18. Demo Day Product Data

If the existing catalog contains demo products:

**PRESERVE THEM.**

Do not automatically create hundreds of fake products.

If the product management workflow is missing, implement the workflow later so products can be added through the application.

For Demo Day, prioritize:

- Coherent product categories
- Realistic product information
- Good product images
- Correct pricing
- Useful specifications
- Consistent product data

## 19. Database Principles

When implementation eventually begins:

Inspect before modifying:

- Tables
- Columns
- Relationships
- Foreign keys
- RLS
- Indexes
- Existing queries

Reuse the current schema wherever possible.

Do not duplicate:

- Products
- Categories
- Sellers
- Product images
- Inventory
- Reviews

Only create migrations for genuinely missing requirements.

## 20. Performance

When implemented later:

Avoid unnecessary full-catalog queries.

Use existing:

- Filtering
- Pagination
- Indexes
- Query helpers

Do not introduce unnecessary AI calls simply to display products.

## 21. Error States

Complete missing product-related error states where necessary.

Examples:

- **Product not found:** "Product not found"
- **Product unavailable:** "Currently unavailable"
- **Image failure:** Use existing image fallback.
- **Seller save failure:** Show a useful error while preserving entered information where possible.
- **Database/API failure:** Do not leave the interface permanently stuck.

## 22. Loading States

Preserve existing loading states.

Where missing, add appropriate states for:

- Product catalog
- Product detail
- Product creation
- Product editing
- Image upload
- Saving
- Deactivation

Avoid unnecessary animations.

## 23. Responsiveness

Group 1 implementation should not break existing layouts on:

- Mobile
- Tablet
- Laptop
- Desktop

Do NOT perform the full visual redesign here.

Group 7 handles the complete UI/UX redesign.

## 24. Systems That Must Not Be Rebuilt

Do NOT rebuild:

### RAG

- `buildSearchQuery()`
- `searchMemoryFn()`
- `buildRagPrompt()`
- `match_memory`
- `smart_kart_ai_knowledge`
- `pgvector`

### Email Composer RAG

- Existing Reply-tab RAG
- `RagBadge`
- `NoMemoryBanner`
- Existing graceful fallback

### Camera Shopping

- Open Camera
- Camera permission
- Live preview
- Capture
- Retake
- Cancel
- Stream cleanup
- Upload fallback
- Existing camera-to-search pipeline

### Checkout

- Existing checkout
- Server-side pricing
- Existing security fixes

### Authentication

- Existing authentication architecture

### Security

- Existing RLS
- Existing security architecture
- Existing dependency fixes

## 25. Future Camera Search Dependency

Group 1 must prepare the product catalog for the future Camera Product Matching improvements.

The current Camera Shopping capture flow is already implemented.

Do NOT implement camera matching improvements as part of this memory specification.

Future Camera Product Matching will use:

```text
Image
 ↓
Vision AI
 ↓
Category detection
 ↓
Product attributes
 ↓
Relevant catalog
 ↓
Similarity matching
 ↓
Ranking
```

Therefore, Group 1 should ensure that product records contain reliable:

- Categories
- Subcategories
- Attributes
- Brands
- Descriptions
- Specifications
- Images

## 26. Acceptance Criteria for Future Implementation

Group 1 will be considered complete only when:

1. Existing product functionality has been audited.
2. Existing working functionality has been preserved.
3. Product data has a reliable single source of truth.
4. Product categories are structured correctly.
5. Product images are properly associated.
6. Product pricing is consistent.
7. Product stock/availability is reliable.
8. Seller product ownership is enforced.
9. Sellers can create products if this functionality was missing.
10. Sellers can edit their own products if this functionality was missing.
11. Sellers can safely deactivate products if required.
12. Product Detail displays accurate product information.
13. Product Detail uses the existing cart.
14. Existing checkout remains intact.
15. Existing AI features continue using the same product data.
16. No duplicate product architecture is created.
17. No unrelated features are modified.
18. Existing security remains intact.
19. Existing Camera Shopping remains intact.
20. Existing RAG remains intact.

## 27. Required Future Implementation Report

When Group 1 is eventually implemented, the implementation should report:

### Already existed and preserved

- ...

### Missing functionality discovered

- ...

### New functionality implemented

- ...

### Existing functionality fixed

- ...

### Database changes

- ...

### RLS/security changes

- ...

### Files/components changed

- ...

### Tests performed

- ...

### Remaining issues

- ...

If something already works:

**DO NOT MODIFY IT JUST TO SAY THAT GROUP 1 WAS IMPLEMENTED.**

## 28. Future UI Rule

The complete professional UI transformation is NOT part of Group 1.

Group 7 will later handle:

- Professional color system
- Typography
- Spacing
- Cards
- Buttons
- Navigation
- Product cards
- AI presentation
- Responsive UX
- Popups
- Modals
- Drawers
- Dropdowns
- Loading states
- Empty states
- Error states

Existing working popups/modals must be preserved until that dedicated UI phase.

## 29. Memory Storage Requirement

STORE THIS SPECIFICATION AS PROJECT MEMORY ONLY.

Recommended memory file:

`mem://features/group-1-product-foundation.md`

Also update the appropriate project memory index so this specification can be retrieved later.

If the project has a roadmap memory file, reference Group 1 there as:

"Group 1 — Product Foundation: Product Catalog + Seller Product Management + Product Detail Experience"

## 30. Absolute No-Implementation Requirement

Again:

**THIS REQUEST IS STORAGE ONLY.**

DO NOT:

- Write application code
- Modify existing code
- Modify database
- Create migrations
- Create components
- Change routes
- Change UI
- Change RLS
- Install packages
- Change dependencies
- Deploy
- Seed products
- Change product data
- Modify Camera Shopping
- Modify RAG
- Modify checkout

ONLY:

1. Store this specification in persistent project memory.
2. Update the memory index.
3. Optionally reference it in the future roadmap.

The stored specification will become the source of truth when the user later explicitly asks:

> "Implement Group 1."

At that time, retrieve this specification first and then **AUDIT** the current Smart Kart AI implementation before making any changes.
