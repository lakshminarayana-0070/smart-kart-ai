---
name: Camera Product Search
description: Future vision AI camera shopping pipeline that captures product images and returns ranked matches from the Smart Kart catalog
type: feature
---
Camera Product Search is an advanced Smart Kart AI shopping feature that allows a customer to use their device camera to capture a real-world product and then find the same product, visually similar products, or relevant products available inside the Smart Kart product catalog.

The final experience must connect:

Camera → Image → Vision AI → Product Understanding → Smart Kart Product Database → Similarity Matching → Ranked Product Results

## 1. User Experience

When the customer opens `Smart Kart AI → Camera Shopping`, the future interface should provide two primary options:

- **Option A — Use Camera:** clear CTA that requests camera permission and provides a live camera preview on supported devices.
- **Option B — Upload Image:** the existing image-upload functionality should remain available.

Both entry points should eventually lead into the same image-analysis pipeline.

```text
                 Camera Shopping
                       |
             ┌─────────┴─────────┐
             ↓                   ↓
        Open Camera         Upload Image
             ↓                   ↓
       Capture Photo        Select Image
             └─────────┬─────────┘
                       ↓
                 Image Preview
                       ↓
                 Analyze Image
                       ↓
              Find Smart Kart
                 Products
```

## 2. Camera Experience

When the user selects Open Camera:

- Request browser/device camera permission.
- Display a live camera preview.
- Provide a clear capture button.
- Allow the user to capture the product.
- Display the captured image for confirmation.
- Provide: Retake, Use Photo, Cancel.

Only after the user confirms **Use Photo** should the image be sent into the AI product-search pipeline. Do not automatically analyze every camera frame.

## 3. Camera Permission Handling

The future implementation must gracefully handle:

- **Permission granted** → continue to live camera preview.
- **Permission denied** → show a helpful message and provide **Upload Image Instead** as the fallback.
- **Camera unavailable** (desktop without camera, browser restriction, another app using camera) → show an appropriate fallback and allow image upload.
- **Browser/device unsupported** → the feature must not crash; the upload-image path must remain usable.

## 4. Image Preview

After capturing or uploading an image, display a preview. The user should be able to **Retake / Replace Image** or **Search This Product**. The image should not be sent repeatedly without user confirmation.

## 5. Vision AI Analysis

After the user confirms the image, Smart Kart AI should use the project's appropriate vision-capable AI model/API. The vision system should attempt to understand:

- Product category
- Product type
- Brand, if visually identifiable
- Model, if identifiable
- Color
- Material
- Shape
- Style
- Major visual characteristics
- Other relevant product attributes

The AI should distinguish between:

- **Exact identification** — the image appears to represent a specific product/model.
- **Similar-product identification** — the exact product cannot be confidently identified, but visually similar products can be found.
- **Uncertain identification** — the image does not provide enough information.

The system should never confidently claim an exact product match when the visual evidence is insufficient.

## 6. Product Database Search

Camera Product Search must NOT stop at "This appears to be a black running shoe." The vision result must be converted into a product-search query against the Smart Kart product catalog. Do not create a completely separate product catalog specifically for Camera Shopping.

```text
Camera Image
     ↓
Vision AI
     ↓
"Black men's running shoe"
     ↓
Smart Kart Product Database
     ↓
Matching Products
```

## 7. Product Matching Levels

- **Level 1 — Exact Product Match:** if the system has enough confidence that the photographed product corresponds to a product in Smart Kart's catalog, show **Exact Match** with an appropriate confidence indicator.
- **Level 2 — Similar Products:** if exact identification is unavailable, show visually and semantically similar products.
- **Level 3 — Category Results:** if similarity matching is limited, fall back to relevant category products.

## 8. Matching Factors

When possible, ranking should consider:

- Product category
- Visual similarity
- Color, style, shape, material
- Brand, model
- Product attributes
- Semantic similarity
- Price, rating
- Availability

Visual/product relevance should remain the primary ranking signal. Do not allow price or rating to override visual relevance completely.

## 9. Result Page

After analysis, the user should see a dedicated Camera Search result experience:

- Captured Image
- Identification label
- Number of matches found
- Product cards with normal Smart Kart e-commerce actions where available (View Product, Price, Rating, Availability, Add to Cart, Wishlist)

## 10. Search Refinement

After receiving results, the user should eventually be able to refine the search, e.g.:

- Under ₹2,000
- Show better-rated products
- Show exact brand
- Show similar products
- Show cheaper alternatives
- Show premium alternatives

This should integrate with Smart Kart's existing search/filter infrastructure rather than creating a separate filtering system.

## 11. Reuse Existing Architecture

When eventually implemented, the feature should reuse the existing Smart Kart architecture:

- Existing product search
- Existing product database
- Existing AI infrastructure
- Existing API integration patterns
- Existing authentication
- Existing UI components
- Existing product cards
- Existing search/filter components
- Existing error/loading components
- Existing RAG infrastructure where relevant

The feature should feel like a native part of Smart Kart AI rather than a separate application.

## 12. RAG Integration

Camera Product Search should NOT automatically use RAG for every image-search operation. Use RAG only where it provides meaningful additional context. Potential RAG use cases:

- Product knowledge
- Brand information
- Seller/product knowledge
- Product descriptions
- Internal product attributes
- Business-specific knowledge
- AI explanations

The core visual matching pipeline should remain:

```text
Image
 ↓
Vision AI
 ↓
Product attributes
 ↓
Product search/matching
```

RAG may enrich the result when relevant:

```text
Vision
 ↓
Product understanding
 ↓
Database search
 ↓
RAG/context enrichment
 ↓
AI explanation
```

Do not unnecessarily slow down every camera search with irrelevant memory retrieval.

## 13. Existing RAG Architecture

If RAG is required during future implementation, reuse the existing Smart Kart RAG architecture and helpers:

- `buildSearchQuery()`
- `searchMemoryFn()`
- `buildRagPrompt()`
- `match_memory`
- `smart_kart_ai_knowledge`
- vector embeddings
- semantic retrieval

Do not create a second independent RAG architecture for Camera Product Search.

## 14. Error States

The future implementation must handle:

- No camera permission → provide upload fallback.
- No camera available → provide upload fallback.
- Invalid image → ask the user to choose another image.
- Image too large → provide an appropriate message and handling.
- Vision AI failure → allow retry.
- Product not recognized → show "We couldn't confidently identify this product" and provide similar/category results if possible.
- No matching products → show "No close matches found" and offer Smart Search, category search, or upload another image.
- API failure → do not leave the UI permanently loading; provide retry.
- Network failure → provide a useful error state.

## 15. Privacy

- Only access the user's camera after explicit browser/device permission.
- Do not continuously record the camera.
- Do not store captured images permanently unless the user explicitly chooses a future feature that requires image history.
- Prefer processing the image only for the requested search.
- Any future image storage must have a clearly defined purpose and privacy/security controls.

## 16. Mobile + Desktop

- **Mobile:** primary interaction is Open Camera → Capture → Search.
- **Desktop:** if a camera exists, Open Camera → Capture → Search; otherwise, Upload Image. The upload path should always remain available.

## 17. Performance

Avoid:

- Continuous unnecessary AI requests
- Repeated vision calls
- Duplicate API requests
- Blocking the entire page during analysis
- Recreating product-search logic

Use clear stages:

```text
Preparing Image
       ↓
Analyzing Image
       ↓
Finding Products
       ↓
Ranking Matches
       ↓
Results
```

## 18. Security

- Validate uploaded files.
- Restrict accepted image types.
- Enforce reasonable image-size limits.
- Do not expose private API keys in frontend code.
- Use existing secure server/API patterns.
- Respect authentication and authorization.
- Ensure product results only expose data the user is allowed to see.
- Follow existing RLS policies.

## 19. Analytics / Future Improvement

Future implementation may track non-sensitive product-search events such as:

- Camera search initiated
- Image captured
- Search completed
- Number of matches
- Product clicked
- Product added to cart

Do not implement analytics now as part of this memory task.

## 20. Success Criteria

Camera Product Search should only be considered complete when all of the following work:

- User can open the camera.
- Camera permission is handled.
- Live preview works.
- User can capture a photo.
- User can retake the photo.
- User can upload an existing image.
- Image preview works.
- Vision AI analyzes the image.
- Product characteristics are extracted.
- Smart Kart product database is searched.
- Exact matches can be returned when possible.
- Similar products can be returned.
- Results are ranked meaningfully.
- Product cards work.
- Product detail navigation works.
- Add-to-cart works where available.
- No-match fallback works.
- Permission-denied fallback works.
- AI/API errors are handled.
- Loading states work.
- Mobile and desktop experiences work.
- Existing upload functionality remains intact.
- Security is validated.
- No unnecessary duplicate AI/search/RAG infrastructure is introduced.

## 21. Implementation Trigger

This feature is NOT to be implemented until the user explicitly says:

> "Implement Camera Product Search using the stored Smart Kart AI specification."

Until that command is given, the current Camera Shopping code, UI, routes, APIs, database, and architecture must remain unchanged.
