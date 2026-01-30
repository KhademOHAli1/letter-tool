-- Supabase Migration: Add postal code tracking for geographic heat maps
-- Phase 8: Frontend Analytics Dashboard
-- 
-- Adds postal_code column to enable geographic breakdown by:
-- - Country
-- - State/Region (derived from postal code prefix)
-- - Electoral district (wahlkreis_id)
-- - Postal code (most granular)

-- Add postal_code column to letter_generations
ALTER TABLE public.letter_generations 
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Add index for postal code queries
CREATE INDEX IF NOT EXISTS idx_letter_generations_postal_code 
ON public.letter_generations(postal_code);

-- Composite index for campaign + postal code (heat map queries)
CREATE INDEX IF NOT EXISTS idx_letter_generations_campaign_postal 
ON public.letter_generations(campaign_id, country, postal_code);

-- Add comment for documentation
COMMENT ON COLUMN public.letter_generations.postal_code IS 
    'Postal/ZIP code of the letter writer. Used for geographic heat map visualizations.';

-- ============================================
-- VIEW: Geographic Heat Map by Postal Code
-- Most granular geographic breakdown
-- ============================================
DROP VIEW IF EXISTS public.campaign_heatmap_postal CASCADE;
CREATE OR REPLACE VIEW public.campaign_heatmap_postal AS
SELECT 
    campaign_id,
    country,
    postal_code,
    COUNT(*) as letter_count,
    COUNT(DISTINCT mdb_id) as unique_reps,
    MAX(created_at) as last_letter_at
FROM public.letter_generations
WHERE campaign_id IS NOT NULL
  AND postal_code IS NOT NULL
  AND postal_code != ''
GROUP BY campaign_id, country, postal_code
ORDER BY campaign_id, country, letter_count DESC;

-- Grant access
GRANT SELECT ON public.campaign_heatmap_postal TO anon, authenticated, service_role;

-- ============================================
-- VIEW: Geographic Heat Map by Electoral District
-- Aggregated by wahlkreis/constituency
-- ============================================
DROP VIEW IF EXISTS public.campaign_heatmap_district CASCADE;
CREATE OR REPLACE VIEW public.campaign_heatmap_district AS
SELECT 
    campaign_id,
    country,
    wahlkreis_id as district_id,
    wahlkreis_name as district_name,
    COUNT(*) as letter_count,
    COUNT(DISTINCT mdb_id) as unique_reps,
    COUNT(DISTINCT postal_code) as unique_postcodes,
    MAX(created_at) as last_letter_at
FROM public.letter_generations
WHERE campaign_id IS NOT NULL
  AND wahlkreis_id IS NOT NULL
GROUP BY campaign_id, country, wahlkreis_id, wahlkreis_name
ORDER BY campaign_id, country, letter_count DESC;

-- Grant access
GRANT SELECT ON public.campaign_heatmap_district TO anon, authenticated, service_role;

-- ============================================
-- VIEW: Geographic Heat Map by Region/State
-- Derived from postal code prefix (first 1-2 digits)
-- Germany: First digit = region (0-9)
-- UK: First letters = postcode area
-- Canada: First letter = province
-- US: First 3 digits = sectional center
-- France: First 2 digits = département
-- ============================================
DROP VIEW IF EXISTS public.campaign_heatmap_region CASCADE;
CREATE OR REPLACE VIEW public.campaign_heatmap_region AS
SELECT 
    campaign_id,
    country,
    CASE 
        WHEN country = 'de' THEN LEFT(postal_code, 1)  -- German PLZ region (0-9)
        WHEN country = 'uk' THEN REGEXP_REPLACE(postal_code, '[0-9].*', '')  -- UK postcode area letters
        WHEN country = 'ca' THEN LEFT(postal_code, 1)  -- Canadian FSA first letter (province)
        WHEN country = 'us' THEN LEFT(postal_code, 3)  -- US ZIP sectional center
        WHEN country = 'fr' THEN LEFT(postal_code, 2)  -- French département
        ELSE LEFT(postal_code, 2)
    END as region_code,
    COUNT(*) as letter_count,
    COUNT(DISTINCT mdb_id) as unique_reps,
    COUNT(DISTINCT wahlkreis_id) as unique_districts,
    COUNT(DISTINCT postal_code) as unique_postcodes,
    MAX(created_at) as last_letter_at
FROM public.letter_generations
WHERE campaign_id IS NOT NULL
  AND postal_code IS NOT NULL
  AND postal_code != ''
GROUP BY 
    campaign_id, 
    country,
    CASE 
        WHEN country = 'de' THEN LEFT(postal_code, 1)
        WHEN country = 'uk' THEN REGEXP_REPLACE(postal_code, '[0-9].*', '')
        WHEN country = 'ca' THEN LEFT(postal_code, 1)
        WHEN country = 'us' THEN LEFT(postal_code, 3)
        WHEN country = 'fr' THEN LEFT(postal_code, 2)
        ELSE LEFT(postal_code, 2)
    END
ORDER BY campaign_id, country, letter_count DESC;

-- Grant access
GRANT SELECT ON public.campaign_heatmap_region TO anon, authenticated, service_role;

-- ============================================
-- VIEW: Geographic Summary by Country
-- Highest level aggregation
-- ============================================
DROP VIEW IF EXISTS public.campaign_heatmap_country CASCADE;
CREATE OR REPLACE VIEW public.campaign_heatmap_country AS
SELECT 
    campaign_id,
    country,
    COUNT(*) as letter_count,
    COUNT(DISTINCT mdb_id) as unique_reps,
    COUNT(DISTINCT wahlkreis_id) as unique_districts,
    COUNT(DISTINCT postal_code) as unique_postcodes,
    MIN(created_at) as first_letter_at,
    MAX(created_at) as last_letter_at
FROM public.letter_generations
WHERE campaign_id IS NOT NULL
GROUP BY campaign_id, country
ORDER BY campaign_id, letter_count DESC;

-- Grant access
GRANT SELECT ON public.campaign_heatmap_country TO anon, authenticated, service_role;

-- Add comments
COMMENT ON VIEW public.campaign_heatmap_postal IS 'Geographic heat map data by postal code - most granular level';
COMMENT ON VIEW public.campaign_heatmap_district IS 'Geographic heat map data by electoral district/constituency';
COMMENT ON VIEW public.campaign_heatmap_region IS 'Geographic heat map data by region/state (derived from postal code prefix)';
COMMENT ON VIEW public.campaign_heatmap_country IS 'Geographic heat map data by country';
