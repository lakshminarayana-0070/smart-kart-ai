create or replace function public.match_memory(
  query_embedding extensions.vector,
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  category text,
  title text,
  content text,
  keywords text[],
  similarity float
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    m.id,
    m.category::text,
    m.title,
    m.content,
    m.keywords,
    1 - (m.embedding <=> query_embedding) as similarity
  from public.smart_kart_ai_knowledge m
  where m.embedding is not null
    and 1 - (m.embedding <=> query_embedding) > match_threshold
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

create index if not exists smart_kart_ai_knowledge_embedding_idx
  on public.smart_kart_ai_knowledge
  using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 100);