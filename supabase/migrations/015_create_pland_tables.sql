-- Plan'd: Group trip planning tables
-- Public SELECT on all tables, INSERT/UPDATE/DELETE restricted to owner

-- 1. Trips
CREATE TABLE IF NOT EXISTS public.pland_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  destination text,
  description text,
  cover_image_url text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pland_trips_user_id ON public.pland_trips(user_id);
CREATE INDEX idx_pland_trips_status ON public.pland_trips(status);

ALTER TABLE public.pland_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view trips" ON public.pland_trips FOR SELECT USING (true);
CREATE POLICY "Users can create trips" ON public.pland_trips FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own trips" ON public.pland_trips FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own trips" ON public.pland_trips FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER trigger_pland_trips_updated_at
  BEFORE UPDATE ON public.pland_trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Members
CREATE TABLE IF NOT EXISTS public.pland_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.pland_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  avatar_color text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pland_members_trip_id ON public.pland_members(trip_id);
CREATE INDEX idx_pland_members_user_id ON public.pland_members(user_id);

ALTER TABLE public.pland_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view members" ON public.pland_members FOR SELECT USING (true);
CREATE POLICY "Users can add members" ON public.pland_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own members" ON public.pland_members FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own members" ON public.pland_members FOR DELETE USING (user_id = auth.uid());

-- 3. Itinerary items
CREATE TABLE IF NOT EXISTS public.pland_itinerary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.pland_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time,
  end_time time,
  title text NOT NULL,
  description text,
  location text,
  link text,
  category text NOT NULL DEFAULT 'activity' CHECK (category IN ('activity', 'transport', 'food', 'accommodation', 'other')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pland_itinerary_trip_id ON public.pland_itinerary_items(trip_id);
CREATE INDEX idx_pland_itinerary_date ON public.pland_itinerary_items(trip_id, date);

ALTER TABLE public.pland_itinerary_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view itinerary" ON public.pland_itinerary_items FOR SELECT USING (true);
CREATE POLICY "Users can add itinerary items" ON public.pland_itinerary_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own itinerary" ON public.pland_itinerary_items FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own itinerary" ON public.pland_itinerary_items FOR DELETE USING (user_id = auth.uid());

-- 4. Ideas
CREATE TABLE IF NOT EXISTS public.pland_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.pland_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  link text,
  location text,
  estimated_cost numeric(10,2),
  votes integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pland_ideas_trip_id ON public.pland_ideas(trip_id);

ALTER TABLE public.pland_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ideas" ON public.pland_ideas FOR SELECT USING (true);
CREATE POLICY "Users can add ideas" ON public.pland_ideas FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own ideas" ON public.pland_ideas FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own ideas" ON public.pland_ideas FOR DELETE USING (user_id = auth.uid());

-- 5. Accommodations
CREATE TABLE IF NOT EXISTS public.pland_accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.pland_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  check_in date,
  check_out date,
  cost numeric(10,2),
  booking_link text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pland_accommodations_trip_id ON public.pland_accommodations(trip_id);

ALTER TABLE public.pland_accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view accommodations" ON public.pland_accommodations FOR SELECT USING (true);
CREATE POLICY "Users can add accommodations" ON public.pland_accommodations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own accommodations" ON public.pland_accommodations FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own accommodations" ON public.pland_accommodations FOR DELETE USING (user_id = auth.uid());

-- 6. Expenses
CREATE TABLE IF NOT EXISTS public.pland_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.pland_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paid_by_member_id uuid REFERENCES public.pland_members(id) ON DELETE SET NULL,
  title text NOT NULL,
  amount numeric(10,2) NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('accommodation', 'food', 'activity', 'transport', 'other')),
  date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pland_expenses_trip_id ON public.pland_expenses(trip_id);

ALTER TABLE public.pland_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view expenses" ON public.pland_expenses FOR SELECT USING (true);
CREATE POLICY "Users can add expenses" ON public.pland_expenses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own expenses" ON public.pland_expenses FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own expenses" ON public.pland_expenses FOR DELETE USING (user_id = auth.uid());

-- 7. Expense splits
CREATE TABLE IF NOT EXISTS public.pland_expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES public.pland_expenses(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.pland_members(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  settled boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_pland_expense_splits_expense_id ON public.pland_expense_splits(expense_id);
CREATE INDEX idx_pland_expense_splits_member_id ON public.pland_expense_splits(member_id);

ALTER TABLE public.pland_expense_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view splits" ON public.pland_expense_splits FOR SELECT USING (true);
-- Splits are managed via the expense owner, so we check via a join
CREATE POLICY "Expense owners can manage splits" ON public.pland_expense_splits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pland_expenses e
      WHERE e.id = expense_id AND e.user_id = auth.uid()
    )
  );

-- 8. Messages
CREATE TABLE IF NOT EXISTS public.pland_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.pland_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  context_type text CHECK (context_type IN ('general', 'itinerary', 'idea', 'expense')),
  context_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pland_messages_trip_id ON public.pland_messages(trip_id);
CREATE INDEX idx_pland_messages_context ON public.pland_messages(context_type, context_id);

ALTER TABLE public.pland_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view messages" ON public.pland_messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON public.pland_messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own messages" ON public.pland_messages FOR DELETE USING (user_id = auth.uid());

-- 9. Gallery
CREATE TABLE IF NOT EXISTS public.pland_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.pland_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pland_gallery_trip_id ON public.pland_gallery(trip_id);

ALTER TABLE public.pland_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gallery" ON public.pland_gallery FOR SELECT USING (true);
CREATE POLICY "Users can add photos" ON public.pland_gallery FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own photos" ON public.pland_gallery FOR DELETE USING (user_id = auth.uid());
