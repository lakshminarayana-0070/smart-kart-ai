import type { Database } from "@/integrations/supabase/types";

export type KnowledgeCategory = Database["public"]["Enums"]["smart_kart_knowledge_category"];
export type KnowledgeEntry = Database["public"]["Tables"]["smart_kart_ai_knowledge"]["Row"];

export const CATEGORIES: { value: KnowledgeCategory; label: string; emoji: string }[] = [
  { value: "shopping_preferences", label: "Shopping Preferences", emoji: "🛍️" },
  { value: "budget_rules", label: "Budget Rules", emoji: "💰" },
  { value: "favorite_brands", label: "Favorite Brands", emoji: "⭐" },
  { value: "product_interests", label: "Product Interests", emoji: "🎯" },
  { value: "purchase_history", label: "Purchase History", emoji: "📦" },
  { value: "wishlist", label: "Wishlist", emoji: "💝" },
  { value: "seller_business_info", label: "Seller Business Info", emoji: "🏪" },
  { value: "marketing_style", label: "Marketing Style", emoji: "📣" },
  { value: "customer_support_rules", label: "Customer Support Rules", emoji: "🤝" },
  { value: "product_catalog_notes", label: "Product Catalog Notes", emoji: "📚" },
  { value: "review_insights", label: "Review Insights", emoji: "🔍" },
  { value: "custom_ai_instructions", label: "Custom AI Instructions", emoji: "🧠" },
];

export const categoryLabel = (c: KnowledgeCategory) =>
  CATEGORIES.find((x) => x.value === c)?.label ?? c;
export const categoryEmoji = (c: KnowledgeCategory) =>
  CATEGORIES.find((x) => x.value === c)?.emoji ?? "✨";

export const wordCount = (s: string) =>
  s.trim().split(/\s+/).filter(Boolean).length;