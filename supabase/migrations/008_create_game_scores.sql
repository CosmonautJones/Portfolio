CREATE TABLE public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL,
  death_cause TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scores" ON public.game_scores FOR SELECT USING (true);
CREATE POLICY "Users insert own scores" ON public.game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_game_scores_top ON public.game_scores(score DESC);
CREATE INDEX idx_game_scores_user ON public.game_scores(user_id);
