-- Supabase Migration: Campaigns table for multi-campaign platform
-- Phase 1, Epic 1.1, Task 1.1.1

-- Create enum type for campaign status
DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- URL-safe identifier for routing (e.g., "iran-2026", "climate-action")
    slug TEXT NOT NULL UNIQUE,
    
    -- Multi-language name and description stored as JSONB
    -- Format: {"en": "Iran 2026", "de": "Iran 2026", "fr": "Iran 2026"}
    name JSONB NOT NULL DEFAULT '{}',
    description JSONB NOT NULL DEFAULT '{}',
    
    -- Campaign status
    status campaign_status NOT NULL DEFAULT 'draft',
    
    -- Campaign context for LLM prompts (background information)
    cause_context TEXT,
    
    -- Countries this campaign is active in (array of country codes)
    country_codes TEXT[] NOT NULL DEFAULT '{}',
    
    -- Campaign goals
    goal_letters INTEGER,
    
    -- Campaign dates
    start_date DATE,
    end_date DATE,
    
    -- Ownership (will be populated after auth is added)
    created_by UUID,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_country_codes ON public.campaigns USING GIN(country_codes);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS campaigns_updated_at ON public.campaigns;
CREATE TRIGGER campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active campaigns (public read)
CREATE POLICY "Anyone can read active campaigns" ON public.campaigns
    FOR SELECT
    USING (status = 'active');

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role has full access" ON public.campaigns
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can read their own campaigns (any status)
-- Note: This will be enhanced when auth is fully implemented
CREATE POLICY "Users can read own campaigns" ON public.campaigns
    FOR SELECT
    TO authenticated
    USING (created_by = auth.uid());

-- Policy: Authenticated users can insert campaigns
CREATE POLICY "Authenticated users can create campaigns" ON public.campaigns
    FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Policy: Users can update their own campaigns
CREATE POLICY "Users can update own campaigns" ON public.campaigns
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Add comments for documentation
COMMENT ON TABLE public.campaigns IS 'Multi-campaign platform: stores campaign definitions for letter-writing advocacy';
COMMENT ON COLUMN public.campaigns.slug IS 'URL-safe unique identifier for the campaign (e.g., iran-2026)';
COMMENT ON COLUMN public.campaigns.name IS 'Multi-language campaign name stored as JSONB: {"en": "Name", "de": "Name"}';
COMMENT ON COLUMN public.campaigns.description IS 'Multi-language campaign description stored as JSONB';
COMMENT ON COLUMN public.campaigns.status IS 'Campaign status: draft, active, paused, completed';
COMMENT ON COLUMN public.campaigns.cause_context IS 'Background context about the cause for LLM prompt generation';
COMMENT ON COLUMN public.campaigns.country_codes IS 'Array of country codes where this campaign is active';
COMMENT ON COLUMN public.campaigns.goal_letters IS 'Target number of letters for the campaign goal';
