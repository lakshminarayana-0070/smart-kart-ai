ALTER TABLE public.smart_kart_ai_knowledge
  ADD COLUMN IF NOT EXISTS knowledge_name TEXT,
  ADD COLUMN IF NOT EXISTS embedding_model TEXT,
  ADD COLUMN IF NOT EXISTS embedding_dimension INTEGER;