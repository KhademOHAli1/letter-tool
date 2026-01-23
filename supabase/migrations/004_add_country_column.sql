-- Supabase Migration: Add country column for multi-country tracking
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)

-- Add country column to letter_generations
-- Default to 'de' for backwards compatibility with existing German data
ALTER TABLE public.letter_generations 
ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'de';

-- Add index for filtering by country
CREATE INDEX IF NOT EXISTS idx_letter_generations_country 
ON public.letter_generations(country);

-- Composite index for country + created_at (common query pattern)
CREATE INDEX IF NOT EXISTS idx_letter_generations_country_date 
ON public.letter_generations(country, created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.letter_generations.country IS 
    'Country code (de, ca) - identifies which campaign the letter belongs to';

-- Optional: Update the stats view to include country filtering
DROP VIEW IF EXISTS public.letter_stats;
CREATE OR REPLACE VIEW public.letter_stats AS
SELECT 
    country,
    COUNT(*) as total_letters,
    COUNT(DISTINCT mdb_id) as unique_representatives_contacted,
    DATE_TRUNC('day', created_at) as date,
    mdb_party as party
FROM public.letter_generations
GROUP BY country, DATE_TRUNC('day', created_at), mdb_party;
