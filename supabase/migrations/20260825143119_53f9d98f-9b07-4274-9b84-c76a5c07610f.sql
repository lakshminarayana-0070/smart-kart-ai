-- Ensure client roles cannot write orders / order_items directly.
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM authenticated, anon;

GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Explicit deny policies for client write paths (fail-closed and self-documenting).
DROP POLICY IF EXISTS "orders no client insert" ON public.orders;
CREATE POLICY "orders no client insert" ON public.orders
  FOR INSERT TO authenticated, anon WITH CHECK (false);

DROP POLICY IF EXISTS "orders no client update" ON public.orders;
CREATE POLICY "orders no client update" ON public.orders
  FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "orders no client delete" ON public.orders;
CREATE POLICY "orders no client delete" ON public.orders
  FOR DELETE TO authenticated, anon USING (false);

DROP POLICY IF EXISTS "order_items no client insert" ON public.order_items;
CREATE POLICY "order_items no client insert" ON public.order_items
  FOR INSERT TO authenticated, anon WITH CHECK (false);

DROP POLICY IF EXISTS "order_items no client update" ON public.order_items;
CREATE POLICY "order_items no client update" ON public.order_items
  FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "order_items no client delete" ON public.order_items;
CREATE POLICY "order_items no client delete" ON public.order_items
  FOR DELETE TO authenticated, anon USING (false);