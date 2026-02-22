-- Add game_type column to support multiple arcade games
ALTER TABLE public.game_scores ADD COLUMN game_type TEXT NOT NULL DEFAULT 'adventure';

CREATE INDEX idx_game_scores_type ON public.game_scores(game_type, score DESC);
