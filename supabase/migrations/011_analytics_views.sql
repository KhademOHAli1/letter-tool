-- Supabase Migration: Analytics Aggregation Views
-- Phase 7: Backend Analytics & Tracking
-- These views provide pre-computed aggregations for dashboard performance

-- ============================================
-- VIEW 1: Campaign Stats (replaces basic campaign_stats)
-- Aggregated stats per campaign
-- ============================================
DROP VIEW IF EXISTS public.campaign_stats CASCADE;
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

-- Grant access
GRANT SELECT ON public.campaign_stats TO anon, authenticated, service_role;

-- ============================================
-- VIEW 2: Letters by Campaign by Day
-- Time series data for charts
-- ============================================
DROP VIEW IF EXISTS public.campaign_letters_by_day CASCADE;
CREATE OR REPLACE VIEW public.campaign_letters_by_day AS
SELECT 
    campaign_id,
    DATE_TRUNC('day', created_at)::date as date,
    country,
    COUNT(*) as letter_count,
    COUNT(DISTINCT mdb_id) as unique_reps
FROM public.letter_generations
WHERE campaign_id IS NOT NULL
GROUP BY campaign_id, DATE_TRUNC('day', created_at)::date, country
ORDER BY campaign_id, date DESC;

-- Grant access
GRANT SELECT ON public.campaign_letters_by_day TO anon, authenticated, service_role;

-- ============================================
-- VIEW 3: Top Demands by Campaign
-- Which demands are most selected
-- ============================================
DROP VIEW IF EXISTS public.campaign_demand_stats CASCADE;
CREATE OR REPLACE VIEW public.campaign_demand_stats AS
SELECT 
    campaign_id,
    unnest(forderung_ids) as demand_id,
    COUNT(*) as selection_count
FROM public.letter_generations
WHERE campaign_id IS NOT NULL
  AND forderung_ids IS NOT NULL
  AND array_length(forderung_ids, 1) > 0
GROUP BY campaign_id, unnest(forderung_ids)
ORDER BY campaign_id, selection_count DESC;

-- Grant access
GRANT SELECT ON public.campaign_demand_stats TO anon, authenticated, service_role;

-- ============================================
-- VIEW 4: Geographic Distribution
-- Letters by country and party
-- ============================================
DROP VIEW IF EXISTS public.campaign_geographic_stats CASCADE;
CREATE OR REPLACE VIEW public.campaign_geographic_stats AS
SELECT 
    campaign_id,
    country,
    mdb_party as party,
    COUNT(*) as letter_count,
    COUNT(DISTINCT mdb_id) as unique_reps,
    COUNT(DISTINCT wahlkreis_id) as unique_districts
FROM public.letter_generations
WHERE campaign_id IS NOT NULL
GROUP BY campaign_id, country, mdb_party
ORDER BY campaign_id, country, letter_count DESC;

-- Grant access
GRANT SELECT ON public.campaign_geographic_stats TO anon, authenticated, service_role;

-- ============================================
-- VIEW 5: Goal Progress View
-- Combines campaign goals with current stats
-- ============================================
DROP VIEW IF EXISTS public.campaign_goal_progress CASCADE;
CREATE OR REPLACE VIEW public.campaign_goal_progress AS
SELECT 
    c.id as campaign_id,
    c.slug,
    c.goal_letters,
    COALESCE(cs.total_letters, 0) as current_letters,
    CASE 
        WHEN c.goal_letters IS NULL OR c.goal_letters = 0 THEN NULL
        ELSE ROUND((COALESCE(cs.total_letters, 0)::numeric / c.goal_letters) * 100, 2)
    END as progress_percentage,
    cs.unique_representatives,
    cs.countries_active,
    cs.first_letter_at,
    cs.last_letter_at
FROM public.campaigns c
LEFT JOIN public.campaign_stats cs ON c.id = cs.campaign_id;

-- Grant access
GRANT SELECT ON public.campaign_goal_progress TO anon, authenticated, service_role;

-- ============================================
-- VIEW 6: Top Representatives by Campaign
-- Most contacted representatives
-- ============================================
DROP VIEW IF EXISTS public.campaign_top_representatives CASCADE;
CREATE OR REPLACE VIEW public.campaign_top_representatives AS
SELECT 
    campaign_id,
    country,
    mdb_id,
    mdb_name,
    mdb_party,
    wahlkreis_name,
    COUNT(*) as letter_count
FROM public.letter_generations
WHERE campaign_id IS NOT NULL
GROUP BY campaign_id, country, mdb_id, mdb_name, mdb_party, wahlkreis_name
ORDER BY campaign_id, letter_count DESC;

-- Grant access
GRANT SELECT ON public.campaign_top_representatives TO anon, authenticated, service_role;

-- ============================================
-- VIEW 7: Platform-wide Stats
-- Global aggregation across all campaigns
-- ============================================
DROP VIEW IF EXISTS public.platform_stats CASCADE;
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT 
    COUNT(*) as total_letters,
    COUNT(DISTINCT mdb_id) as total_representatives,
    COUNT(DISTINCT campaign_id) as active_campaigns,
    COUNT(DISTINCT country) as countries_active,
    MIN(created_at) as first_letter_at,
    MAX(created_at) as last_letter_at
FROM public.letter_generations;

-- Grant access
GRANT SELECT ON public.platform_stats TO anon, authenticated, service_role;

-- ============================================
-- VIEW 8: Campaign Breakdown for Platform
-- Per-campaign summary for platform dashboard
-- ============================================
DROP VIEW IF EXISTS public.campaign_summary CASCADE;
CREATE OR REPLACE VIEW public.campaign_summary AS
SELECT 
    c.id as campaign_id,
    c.slug,
    c.name,
    c.status,
    c.goal_letters,
    c.country_codes,
    COALESCE(cs.total_letters, 0) as total_letters,
    COALESCE(cs.unique_representatives, 0) as unique_representatives,
    cs.first_letter_at,
    cs.last_letter_at,
    CASE 
        WHEN c.goal_letters IS NULL OR c.goal_letters = 0 THEN NULL
        ELSE ROUND((COALESCE(cs.total_letters, 0)::numeric / c.goal_letters) * 100, 2)
    END as progress_percentage
FROM public.campaigns c
LEFT JOIN public.campaign_stats cs ON c.id = cs.campaign_id
WHERE c.status = 'active'
ORDER BY COALESCE(cs.total_letters, 0) DESC;

-- Grant access
GRANT SELECT ON public.campaign_summary TO anon, authenticated, service_role;

-- Add comments for documentation
COMMENT ON VIEW public.campaign_stats IS 'Aggregated stats per campaign - total letters, unique reps, countries';
COMMENT ON VIEW public.campaign_letters_by_day IS 'Time series data for campaign analytics charts';
COMMENT ON VIEW public.campaign_demand_stats IS 'Demand selection frequency per campaign';
COMMENT ON VIEW public.campaign_geographic_stats IS 'Geographic and party distribution per campaign';
COMMENT ON VIEW public.campaign_goal_progress IS 'Campaign goal progress with percentage';
COMMENT ON VIEW public.campaign_top_representatives IS 'Most contacted representatives per campaign';
COMMENT ON VIEW public.platform_stats IS 'Platform-wide aggregated statistics';
COMMENT ON VIEW public.campaign_summary IS 'Campaign summary for platform dashboard';
