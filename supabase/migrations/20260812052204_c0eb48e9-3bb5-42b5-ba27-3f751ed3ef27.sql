DROP POLICY IF EXISTS "orders self insert" ON public.orders;
DROP POLICY IF EXISTS "order_items self insert" ON public.order_items;
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM authenticated, anon;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;