-- game_achievements table
CREATE TABLE public.game_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  game_score INT,
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE public.game_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON public.game_achievements FOR SELECT USING (true);
CREATE POLICY "Users insert own achievements" ON public.game_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_game_achievements_user ON public.game_achievements(user_id);
CREATE INDEX idx_game_achievements_id ON public.game_achievements(achievement_id);

-- Add display_name to game_scores
ALTER TABLE public.game_scores ADD COLUMN display_name TEXT;
