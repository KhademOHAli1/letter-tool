-- Supabase Migration: Add geo coordinates to campaign targets
-- Enables more accurate distance-based target lookup using lat/lng

-- Add latitude and longitude columns
ALTER TABLE public.campaign_targets
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add index for geo queries (useful for bounding box queries)
CREATE INDEX IF NOT EXISTS idx_campaign_targets_geo
    ON public.campaign_targets(latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.campaign_targets.latitude IS
    'Latitude coordinate for distance calculations. Optional but improves accuracy.';
COMMENT ON COLUMN public.campaign_targets.longitude IS
    'Longitude coordinate for distance calculations. Optional but improves accuracy.';

-- Function to calculate Haversine distance between two points (in kilometers)
-- This is used for finding nearest targets when geo coordinates are available
CREATE OR REPLACE FUNCTION public.haversine_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371; -- Earth's radius in km
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;
    
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat / 2) * sin(dlat / 2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dlon / 2) * sin(dlon / 2);
    c := 2 * atan2(sqrt(a), sqrt(1 - a));
    
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.haversine_distance IS
    'Calculates the great-circle distance between two points using the Haversine formula. Returns distance in kilometers.';
