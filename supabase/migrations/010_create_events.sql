-- Events table: tracks all user interactions for XP, achievements, analytics
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users insert own events"
  ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own events
CREATE POLICY "Users read own events"
  ON public.events FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_events_user_type ON public.events(user_id, event_type);
CREATE INDEX idx_events_created ON public.events(created_at DESC);
