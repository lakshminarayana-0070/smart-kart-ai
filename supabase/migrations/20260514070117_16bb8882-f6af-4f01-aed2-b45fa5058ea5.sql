
create table public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ai_chats enable row level security;
create policy "ai_chats self all" on public.ai_chats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index ai_chats_user_idx on public.ai_chats(user_id, updated_at desc);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.ai_chats(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  tokens_in integer,
  tokens_out integer,
  created_at timestamptz not null default now()
);
alter table public.ai_messages enable row level security;
create policy "ai_messages self all" on public.ai_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index ai_messages_chat_idx on public.ai_messages(chat_id, created_at);

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  model text,
  tokens_in integer,
  tokens_out integer,
  created_at timestamptz not null default now()
);
alter table public.ai_generations enable row level security;
create policy "ai_generations self all" on public.ai_generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index ai_generations_user_idx on public.ai_generations(user_id, created_at desc);
