CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE smart_kart_knowledge_category AS ENUM (
  'shopping_preferences',
  'budget_rules',
  'favorite_brands',
  'product_interests',
  'purchase_history',
  'wishlist',
  'seller_business_info',
  'marketing_style',
  'customer_support_rules',
  'product_catalog_notes',
  'review_insights',
  'custom_ai_instructions'
);

CREATE TABLE public.smart_kart_ai_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category smart_kart_knowledge_category NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[],
  embedding VECTOR(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.smart_kart_ai_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own knowledge"
ON public.smart_kart_ai_knowledge FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge"
ON public.smart_kart_ai_knowledge FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge"
ON public.smart_kart_ai_knowledge FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge"
ON public.smart_kart_ai_knowledge FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_smart_kart_ai_knowledge_user_id
  ON public.smart_kart_ai_knowledge(user_id);

CREATE INDEX idx_smart_kart_ai_knowledge_category
  ON public.smart_kart_ai_knowledge(category);

CREATE INDEX idx_smart_kart_ai_knowledge_embedding
  ON public.smart_kart_ai_knowledge
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_smart_kart_ai_knowledge_updated_at
BEFORE UPDATE ON public.smart_kart_ai_knowledge
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();