
-- Roles
create type public.app_role as enum ('admin', 'customer');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  role app_role not null,
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

-- Profile auto-create + assign customer role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  image_url text,
  images jsonb default '[]'::jsonb,
  category_id uuid references public.categories(id),
  rating numeric(2,1) default 4.5,
  review_count int default 0,
  stock int default 100,
  is_trending boolean default false,
  is_featured boolean default false,
  ai_summary text,
  ai_pros jsonb default '[]'::jsonb,
  ai_cons jsonb default '[]'::jsonb,
  ai_trust_score int default 85,
  tags jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;

-- Wishlist
create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table public.wishlist enable row level security;

-- Cart
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table public.cart_items enable row level security;

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  total numeric(10,2) not null,
  status text not null default 'pending',
  shipping_address jsonb,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  product_id uuid not null references public.products,
  quantity int not null,
  price numeric(10,2) not null
);
alter table public.order_items enable row level security;

-- Search history
create table public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  query text not null,
  created_at timestamptz not null default now()
);
alter table public.search_history enable row level security;

-- Recently viewed
create table public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  viewed_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table public.recently_viewed enable row level security;

-- RLS Policies
create policy "profiles self read" on public.profiles for select using (auth.uid()=id);
create policy "profiles self update" on public.profiles for update using (auth.uid()=id);

create policy "user_roles self read" on public.user_roles for select using (auth.uid()=user_id);

create policy "categories public read" on public.categories for select using (true);
create policy "products public read" on public.products for select using (true);

create policy "wishlist self all" on public.wishlist for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "cart self all" on public.cart_items for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "orders self read" on public.orders for select using (auth.uid()=user_id);
create policy "orders self insert" on public.orders for insert with check (auth.uid()=user_id);
create policy "order_items self read" on public.order_items for select using (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create policy "order_items self insert" on public.order_items for insert with check (exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
create policy "search_history self all" on public.search_history for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "recently_viewed self all" on public.recently_viewed for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
