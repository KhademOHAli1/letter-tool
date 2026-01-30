-- Supabase Migration: Add campaign_id to letter_generations
-- Phase 1, Epic 1.1, Task 1.1.4

-- Add campaign_id column to letter_generations
-- Nullable for backward compatibility with existing letters
ALTER TABLE public.letter_generations 
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- Add index for filtering letters by campaign
CREATE INDEX IF NOT EXISTS idx_letter_generations_campaign_id 
ON public.letter_generations(campaign_id);

-- Composite index for campaign + created_at (common query pattern for stats)
CREATE INDEX IF NOT EXISTS idx_letter_generations_campaign_date 
ON public.letter_generations(campaign_id, created_at DESC);

-- Composite index for campaign + country (for multi-country campaigns)
CREATE INDEX IF NOT EXISTS idx_letter_generations_campaign_country 
ON public.letter_generations(campaign_id, country);

-- Add comment for documentation
COMMENT ON COLUMN public.letter_generations.campaign_id IS 
    'FK to campaigns table - identifies which campaign this letter was generated for. NULL for legacy letters before campaign system.';

-- Update the stats view to include campaign filtering
DROP VIEW IF EXISTS public.letter_stats;
CREATE OR REPLACE VIEW public.letter_stats AS
SELECT 
    campaign_id,
    country,
    COUNT(*) as total_letters,
    COUNT(DISTINCT mdb_id) as unique_representatives_contacted,
    DATE_TRUNC('day', created_at) as date,
    mdb_party as party
FROM public.letter_generations
GROUP BY campaign_id, country, DATE_TRUNC('day', created_at), mdb_party;

-- Grant select on the view
GRANT SELECT ON public.letter_stats TO anon, authenticated, service_role;

-- Create a helper view for campaign-level aggregates
CREATE OR REPLACE VIEW public.campaign_stats AS
SELECT 
    campaign_id,
    COUNT(*) as total_letters,
    COUNT(DISTINCT mdb_id) as unique_representatives,
    COUNT(DISTINCT country) as countries_active,
    MIN(created_at) as first_letter_at,
    MAX(created_at) as last_letter_at
FROM public.letter_generations
WHERE campaign_id IS NOT NULL
GROUP BY campaign_id;

-- Grant select on the view
GRANT SELECT ON public.campaign_stats TO anon, authenticated, service_role;

COMMENT ON VIEW public.campaign_stats IS 'Aggregate statistics per campaign for dashboard display';
