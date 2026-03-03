-- Add coin tracking columns to game_scores
ALTER TABLE public.game_scores ADD COLUMN IF NOT EXISTS coins_collected INT NOT NULL DEFAULT 0;
ALTER TABLE public.game_scores ADD COLUMN IF NOT EXISTS coin_bonus INT NOT NULL DEFAULT 0;
