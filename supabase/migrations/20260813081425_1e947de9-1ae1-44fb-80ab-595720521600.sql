-- 1. Categories: optional parent for subcategories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories(parent_id);

-- 2. Products: seller ownership + missing catalog fields
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_status_check CHECK (status IN ('active','draft','inactive'));
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_price_check;
ALTER TABLE public.products ADD CONSTRAINT products_price_check CHECK (price >= 0);
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_stock_check;
ALTER TABLE public.products ADD CONSTRAINT products_stock_check CHECK (stock >= 0);
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_compare_price_check;
ALTER TABLE public.products ADD CONSTRAINT products_compare_price_check CHECK (compare_at_price IS NULL OR compare_at_price >= price);

CREATE INDEX IF NOT EXISTS products_seller_id_idx ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS products_status_idx ON public.products(status);
CREATE INDEX IF NOT EXISTS products_subcategory_id_idx ON public.products(subcategory_id);

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Grants for seller-owned writes
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;

-- 4. RLS: public sees active products; sellers fully manage only their own
DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read active" ON public.products
  FOR SELECT USING (status = 'active');
CREATE POLICY "products seller read own" ON public.products
  FOR SELECT TO authenticated USING (seller_id = auth.uid());
CREATE POLICY "products seller insert own" ON public.products
  FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());
CREATE POLICY "products seller update own" ON public.products
  FOR UPDATE TO authenticated USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());
CREATE POLICY "products seller delete own" ON public.products
  FOR DELETE TO authenticated USING (seller_id = auth.uid());

-- 5. Subcategory seed (only where missing)
INSERT INTO public.categories (name, slug, icon, parent_id)
SELECT v.name, v.slug, v.icon, p.id
FROM (VALUES
  ('Phones','phones','Smartphone','electronics'),
  ('Laptops','laptops','Laptop','electronics'),
  ('Earbuds','earbuds','Headphones','electronics'),
  ('Smartwatches','smartwatches','Watch','electronics'),
  ('Shoes','shoes','Footprints','fashion'),
  ('Clothing','clothing','Shirt','fashion'),
  ('Accessories','accessories','Glasses','fashion'),
  ('Appliances','appliances','Plug','home'),
  ('Furniture','furniture','Armchair','home'),
  ('Kitchen','kitchen','CookingPot','home')
) AS v(name, slug, icon, parent_slug)
JOIN public.categories p ON p.slug = v.parent_slug
WHERE NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.slug = v.slug);

-- 6. Product image storage policies (bucket created separately)
DROP POLICY IF EXISTS "product images public read" ON storage.objects;
CREATE POLICY "product images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "product images owner insert" ON storage.objects;
CREATE POLICY "product images owner insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "product images owner update" ON storage.objects;
CREATE POLICY "product images owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "product images owner delete" ON storage.objects;
CREATE POLICY "product images owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);