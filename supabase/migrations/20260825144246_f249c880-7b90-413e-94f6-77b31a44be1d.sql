-- =========================================================
-- REVIEWS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  is_verified_purchase boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews public read on visible products"
  ON public.reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = reviews.product_id AND p.status = 'active'));

CREATE POLICY "reviews author read own"
  ON public.reviews FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "reviews author insert own"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews author update own"
  ON public.reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews author delete own"
  ON public.reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "reviews admin read"
  ON public.reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_user_idx ON public.reviews (user_id, created_at DESC);

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verified purchase is derived server-side, never trusted from the client.
CREATE OR REPLACE FUNCTION public.set_review_verified_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_verified_purchase := EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = NEW.product_id
      AND o.user_id = NEW.user_id
      AND o.status <> 'cancelled'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_set_verified_purchase
  BEFORE INSERT OR UPDATE OF product_id ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_review_verified_purchase();

-- Keep products.rating / review_count in sync with real reviews.
CREATE OR REPLACE FUNCTION public.refresh_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid := COALESCE(NEW.product_id, OLD.product_id);
BEGIN
  UPDATE public.products p
  SET rating = COALESCE(agg.avg_rating, p.rating),
      review_count = COALESCE(agg.cnt, 0)
  FROM (
    SELECT round(avg(rating)::numeric, 2) AS avg_rating, count(*) AS cnt
    FROM public.reviews WHERE product_id = target
  ) agg
  WHERE p.id = target;
  RETURN NULL;
END;
$$;

CREATE TRIGGER reviews_refresh_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_product_rating();

-- =========================================================
-- SELLER PROFILES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  store_slug text UNIQUE,
  description text,
  logo_url text,
  support_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.seller_profiles TO authenticated;
GRANT SELECT ON public.seller_profiles TO anon;
GRANT ALL ON public.seller_profiles TO service_role;

ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_profiles public read"
  ON public.seller_profiles FOR SELECT USING (true);

CREATE POLICY "seller_profiles insert own"
  ON public.seller_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "seller_profiles update own"
  ON public.seller_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TRIGGER update_seller_profiles_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- ORDERS: lifecycle + validation
-- =========================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'placed';

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','placed','confirmed','shipped','delivered','cancelled'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_total_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_total_check CHECK (total >= 0);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders (user_id, created_at DESC);

-- =========================================================
-- ORDER ITEMS: validation + seller/admin visibility
-- =========================================================
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_quantity_check;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_quantity_check CHECK (quantity >= 1);

ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_price_check;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_price_check CHECK (price >= 0);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_product_idx ON public.order_items (product_id);

CREATE POLICY "order_items seller read own products"
  ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = order_items.product_id AND p.seller_id = auth.uid()));

CREATE POLICY "order_items admin read"
  ON public.order_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "orders admin read"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "products admin read all"
  ON public.products FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- CART: quantity validation
-- =========================================================
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_quantity_check;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_quantity_check
  CHECK (quantity >= 1 AND quantity <= 99);

CREATE INDEX IF NOT EXISTS cart_items_product_idx ON public.cart_items (product_id);
CREATE INDEX IF NOT EXISTS wishlist_product_idx ON public.wishlist (product_id);