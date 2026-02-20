-- Fix RLS performance: wrap auth.uid() in subselect (evaluated once per query, not per row)
DROP POLICY "Users can view own notes" ON public.notes;
CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY "Users can create own notes" ON public.notes;
CREATE POLICY "Users can create own notes"
  ON public.notes FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- Fix security: set immutable search_path on trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
