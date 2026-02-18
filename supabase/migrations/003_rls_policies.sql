-- Enable RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Tools: all authenticated users can read
-- Write operations use service_role client in admin server actions (bypasses RLS)
CREATE POLICY "Authenticated users can read tools"
  ON public.tools FOR SELECT TO authenticated
  USING (true);

-- Notes: per-user CRUD
CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own notes"
  ON public.notes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE TO authenticated
  USING (user_id = auth.uid());
