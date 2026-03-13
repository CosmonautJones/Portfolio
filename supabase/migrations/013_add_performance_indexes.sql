CREATE INDEX IF NOT EXISTS idx_tools_type ON public.tools(type);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON public.tools(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_user_created ON public.notes(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_created ON public.game_scores(created_at);
CREATE INDEX IF NOT EXISTS idx_game_scores_type_score ON public.game_scores(game_type, score DESC);
